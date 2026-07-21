import { Grupo, Lancamento, Malote, Item, Descricao } from "./types";

export interface LinhaDetalhe {
  /** id do lançamento (para linhas "lancamento"/"malote-item") ou do malote (para "malote"). */
  refId: string;
  tipo: "lancamento" | "malote" | "malote-item";
  data: string;
  /** Competência (yyyy-MM) — presente em "lancamento"/"malote-item". */
  competencia?: string;
  item?: string;
  documento?: string;
  descricao: string;
  valor: number;
  observacao?: string;
  /** id do malote pai — presente apenas em linhas "malote-item". */
  malote_id?: string;
}

export interface BlocoGrupo {
  grupo: Grupo;
  linhas: LinhaDetalhe[];
  total: number;
}

/**
 * Monta os blocos do razonete seguindo o processo:
 * 1. Ordenar grupos
 * 2. Gerar blocos de cada grupo
 * 3. Inserir lançamentos sem malote
 * 4. Consolidar lançamentos com malote (linha do malote + subitens agrupados)
 * 5. Ordenar linhas por data
 * 6. Calcular totais (subitens de malote não entram na soma, pois já estão
 *    representados pela linha consolidada do malote)
 */
export function montarRazonete(
  grupos: Grupo[],
  lancamentos: Lancamento[],
  malotes: Malote[],
  itens: Item[],
  descricoes: Descricao[]
): BlocoGrupo[] {
  const itemMap = new Map(itens.map((i) => [i.id, i.nome]));
  const descricaoMap = new Map(descricoes.map((d) => [d.id, d.descricao]));

  const gruposAtivos = grupos
    .filter((g) => g.ativo)
    .sort((a, b) => a.ordem - b.ordem);

  return gruposAtivos.map((grupo) => {
    interface GrupoLinha {
      dataOrdenacao: string;
      linhas: LinhaDetalhe[];
    }
    const gruposDeLinha: GrupoLinha[] = [];

    // Lançamentos sem malote, pertencentes a este grupo
    const soltos = lancamentos.filter(
      (l) => l.grupo_id === grupo.id && !l.malote_id
    );
    for (const l of soltos) {
      gruposDeLinha.push({
        dataOrdenacao: l.data,
        linhas: [
          {
            refId: l.id,
            tipo: "lancamento",
            data: l.data,
            competencia: l.competencia || l.data.slice(0, 7),
            item: itemMap.get(l.item_id) ?? "—",
            documento: l.documento,
            descricao: descricaoMap.get(l.descricao_id) ?? "—",
            valor: l.valor,
            observacao: l.observacao,
          },
        ],
      });
    }

    // Malotes deste grupo: linha consolidada + subitens agrupados
    const malotesDoGrupo = malotes.filter((m) => m.grupo_id === grupo.id);
    for (const m of malotesDoGrupo) {
      const maloteLine: LinhaDetalhe = {
        refId: m.id,
        tipo: "malote",
        data: m.data,
        descricao: m.descricao,
        valor: m.valor_total,
      };

      const subitens = lancamentos
        .filter((l) => l.malote_id === m.id)
        .sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0))
        .map<LinhaDetalhe>((l) => ({
          refId: l.id,
          tipo: "malote-item",
          data: l.data,
          competencia: l.competencia || l.data.slice(0, 7),
          item: itemMap.get(l.item_id) ?? "—",
          documento: l.documento,
          descricao: descricaoMap.get(l.descricao_id) ?? "—",
          valor: l.valor,
          observacao: l.observacao,
          maloteId: m.id,
        }));

      gruposDeLinha.push({
        dataOrdenacao: m.data,
        linhas: [maloteLine, ...subitens],
      });
    }

    // Ordena os blocos (lançamento avulso ou malote+subitens) por data
    gruposDeLinha.sort((a, b) =>
      a.dataOrdenacao < b.dataOrdenacao ? -1 : a.dataOrdenacao > b.dataOrdenacao ? 1 : 0
    );

    const linhas = gruposDeLinha.flatMap((g) => g.linhas);

    const total = linhas
      .filter((l) => l.tipo !== "malote-item")
      .reduce((acc, l) => acc + l.valor, 0);

    return { grupo, linhas, total };
  });
}

/** Recalcula o valorTotal de um malote a partir dos lançamentos vinculados. */
export function calcularTotalMalote(
  maloteId: string,
  lancamentos: Lancamento[]
): number {
  return lancamentos
    .filter((l) => l.malote_id === maloteId)
    .reduce((acc, l) => acc + l.valor, 0);
}

/**
 * Saldo líquido (entradas - despesas) de um único mês (yyyy-MM), considerando
 * todos os grupos. Ignora grupos marcados para não somar no saldo. Usado
 * para o "total do mês anterior" nas exportações.
 */
export function saldoDoMes(
  grupos: Grupo[],
  lancamentos: Lancamento[],
  mesIso: string
): number {
  const tipoPorGrupo = new Map(grupos.map((g) => [g.id, g.tipo]));
  const contaPorGrupo = new Map(grupos.map((g) => [g.id, g.calcular_no_saldo !== false]));
  return lancamentos
    .filter((l) => l.data.startsWith(mesIso) && contaPorGrupo.get(l.grupo_id))
    .reduce((acc, l) => {
      const tipo = tipoPorGrupo.get(l.grupo_id);
      if (tipo === "entrada") return acc + l.valor;
      if (tipo === "despesa") return acc - l.valor;
      return acc;
    }, 0);
}

/** Soma simples de todos os blocos (sem considerar sinal por tipo). */
export function saldoGeral(blocos: BlocoGrupo[]): number {
  return blocos.reduce((acc, b) => acc + b.total, 0);
}

/** Total agregado de todos os grupos de um tipo (entrada ou despesa), exceto os marcados para não somar. */
export function totalPorTipo(
  blocos: BlocoGrupo[],
  tipo: "entrada" | "despesa"
): number {
  return blocos
    .filter((b) => b.grupo.tipo === tipo && b.grupo.calcular_no_saldo !== false)
    .reduce((acc, b) => acc + b.total, 0);
}

/** Saldo geral com sinal: entradas somam, despesas subtraem. */
export function saldoComSinal(blocos: BlocoGrupo[]): number {
  return totalPorTipo(blocos, "entrada") - totalPorTipo(blocos, "despesa");
}

/**
 * Soma assinada (entradas somam, despesas subtraem) de todos os lançamentos
 * com data anterior a `dataCorteIsoExclusive`, usados como saldo de abertura
 * de um período. Considera o lançamento individual mesmo quando ele está
 * dentro de um malote, já que o total do malote é a soma dos seus itens.
 */
export function saldoAcumuladoAte(
  grupos: Grupo[],
  lancamentos: Lancamento[],
  dataCorteIsoExclusive: string
): number {
  const tipoPorGrupo = new Map(grupos.map((g) => [g.id, g.tipo]));
  return lancamentos
    .filter((l) => l.data < dataCorteIsoExclusive)
    .reduce((acc, l) => {
      const tipo = tipoPorGrupo.get(l.grupo_id);
      if (tipo === "entrada") return acc + l.valor;
      if (tipo === "despesa") return acc - l.valor;
      return acc;
    }, 0);
}
