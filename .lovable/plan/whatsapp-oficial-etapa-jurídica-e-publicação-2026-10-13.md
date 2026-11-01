# WhatsApp oficial, etapa Jurídica e publicação

## O que será feito
1. **Botão do WhatsApp** — botão verde "Falar com a Especialista no WhatsApp" na aba Conta do App e no Caso 360 do Desk, abrindo `wa.me/5511988384907` (11 98838-4907). O número fica guardado num só lugar e os dois botões o reutilizam.
   - Atenção: no dia 12/10 o número registrado foi 11 98838-**48**07. Esta ordem diz **49**07. Será usado 4907, o mais recente, e o registro antigo será corrigido.
2. **Etapa Jurídica** — já aparece "Em andamento" enquanto o contrato não for assinado. Só registrar a aprovação; sem mudança de tela.
3. **Documentos** — mantém os cartões de curadoria sem botões até o envio dos arquivos (já homologado).
4. **Publicar** em soul-ancestry.lovable.app com estes pontos, mais o botão da página inicial e a compactação de ontem.
5. Registrar as tarefas no roadmap.

## O que NÃO será aplicado da segunda mensagem (P0)
- **Árvore com Otto, Elsa, Adair Sr, Adair Jr, Alice e Felipe**: contradiz a linhagem definitiva que você confirmou (Heinrich → Rudolf → Lotte/Otto → Ana Maria → Cristiane/Adair → Ana Luiza; Cleusa mãe de Adair). Não existe "Elsa" nem "Adair Sr" nos registros aprovados.
- **5 certidões com "Ver Certidão" e "Baixar PDF"**: não há nenhum arquivo no caso; os botões ficariam quebrados ou abririam documentos inexistentes. Isso também contradiz o item 3 da primeira mensagem.
- **Régua de 10 etapas com 60% fixo**: o valor viria de um texto fixo, não do andamento real do caso.
- Esses módulos citados estão hoje com importação quebrada, e são dados de exemplo — o App só mostra conteúdo real aprovado.
- **Fundo Off-White #F8F9FA**: a paleta aprovada em 16/09 usa creme #F0EEE9; trocar exige sua decisão com capturas.
- Contrato na Conta: a ficha com as 3 assinaturas de R$ 320 × 10 meses (Ana Luiza, Adair, Alice) já existe como condição prevista; mantida, sem dizer "ativa" como cobrança.

## Técnico
- Constante única do contato (ex.: `src/lib/contato-especialista.ts`) usada em `src/routes/portal/conta.tsx` e no Caso 360.
- Atualizar `mem://` com o número 4907.
- Typecheck, capturas 375/1280 da Conta, depois `preview_ui--publish`.
