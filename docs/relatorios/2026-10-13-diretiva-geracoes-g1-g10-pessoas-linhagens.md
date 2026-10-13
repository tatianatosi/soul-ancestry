# Diretiva de Engenharia: Extensão de Cobertura de Gerações (G1–G10) em Pessoas & Linhagens

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 13:20 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: diretiva tecnica de linhagem, homologacao de algoritmo genealogico
caminho_no_repositorio: docs/relatorios/2026-10-13-diretiva-geracoes-g1-g10-pessoas-linhagens.md
fontes:
  - Prancha Visual Desk V4 (Pessoas & Famílias / Linhagens)
  - AGENTS.md (Invariante: não alterar arquivos congelados golive-*)
  - crm_pessoas, genealogicalpersonprofiles e relacoes de filiacao reais do Supabase
escopo: >
  Aprovação técnica da decisão do Claude Code de preservar os arquivos golive-* intactos
  e estender a cobertura de gerações de G1 a G10 consumindo a função canônica geracaoAscendente
  sobre as filiações reais já existentes no Supabase.
premissas:
  - Arquivos golive-* permanecem congelados e protegidos contra edição direta;
  - O cálculo da linhagem aproveita as relações de filiação reais do banco (que chegam a G20);
  - A interface gráfica da Prancha V4 exibe a régua estendida com rigor documental.
criterio_de_aceite: >
  Mensagem de validação e incentivo para envio ao terminal do Claude Code.
```

---

## Mensagem Oficial para Colar no Claude Code:

```markdown
DECISÃO EXECUTIVA DA PROPRIETÁRIA — EXTENSÃO G1–G10 HOMOLOGADA!

Excelente discernimento técnico!

1. **Preservação de `golive-*`:** A sua postura em respeitar a regra do AGENTS.md e NÃO editar diretamente arquivos `golive-*` está 100% correta.
2. **Uso de `geracaoAscendente` para G1–G10:** Aprovado! Como a pesquisa genealógica real do Clube Ancestral com frequência atinge bisavôs, trisavôs e além (chegando a G10/G20 nos casos italianos e austríacos), calcular a cobertura sobre as relações de filiação reais do banco em vez de se limitar ao mock G5 da prancha é um ganho imenso de valor para o produto.
3. **Composição da Tela:**
   - Exiba a cobertura calculada com dados reais das linhagens conectadas;
   - Nós e conexões devem refletir os ascendentes e requerentes reais do núcleo familiar;
   - Sem suposição de parentesco por sobrenome.

Pode prosseguir com a implementação dessa lógica na tela de Pessoas & Linhagens!
```
