CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.casos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id text NOT NULL UNIQUE,
  cliente_nome text NOT NULL,
  case_nome text,
  pais text,
  via text NOT NULL DEFAULT 'a-definir',
  status text NOT NULL DEFAULT 'em_leitura',
  responsavel text,
  produto_sku text,
  produto_nome text,
  canvas_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  canvas_publicado boolean NOT NULL DEFAULT false,
  dados_sensiveis_ocultos boolean NOT NULL DEFAULT true,
  ultima_atualizacao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.casos TO service_role;
ALTER TABLE public.casos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "casos_service_role" ON public.casos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER casos_updated_at BEFORE UPDATE ON public.casos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE UNIQUE INDEX casos_canvas_token_idx ON public.casos (canvas_token);

CREATE TABLE public.touchpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id uuid NOT NULL REFERENCES public.casos(id) ON DELETE CASCADE,
  canal text NOT NULL,
  direcao text NOT NULL DEFAULT 'saida',
  ocorrido_em timestamptz NOT NULL DEFAULT now(),
  autor text,
  resumo text NOT NULL,
  conteudo text,
  transcricao text,
  aguardando_resposta boolean NOT NULL DEFAULT false,
  interno boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.touchpoints TO service_role;
ALTER TABLE public.touchpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "touchpoints_service_role" ON public.touchpoints FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER touchpoints_updated_at BEFORE UPDATE ON public.touchpoints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX touchpoints_caso_idx ON public.touchpoints (caso_id, ocorrido_em DESC);

CREATE TABLE public.microentregas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id uuid NOT NULL REFERENCES public.casos(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL DEFAULT 'pesquisa',
  status text NOT NULL DEFAULT 'planejada',
  visivel_cliente boolean NOT NULL DEFAULT false,
  prazo date,
  entregue_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.microentregas TO service_role;
ALTER TABLE public.microentregas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "microentregas_service_role" ON public.microentregas FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER microentregas_updated_at BEFORE UPDATE ON public.microentregas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX microentregas_caso_idx ON public.microentregas (caso_id);

CREATE TABLE public.planner_tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id uuid NOT NULL REFERENCES public.casos(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  etapa text NOT NULL DEFAULT 'diagnostico',
  prioridade text NOT NULL DEFAULT 'media',
  status text NOT NULL DEFAULT 'aberta',
  responsavel text,
  prazo date,
  concluida_em timestamptz,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.planner_tarefas TO service_role;
ALTER TABLE public.planner_tarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "planner_service_role" ON public.planner_tarefas FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER planner_updated_at BEFORE UPDATE ON public.planner_tarefas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX planner_caso_idx ON public.planner_tarefas (caso_id, status);

CREATE TABLE public.sla_regras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave text NOT NULL UNIQUE,
  rotulo text NOT NULL,
  descricao text,
  horas_alvo integer NOT NULL,
  aplica_a text NOT NULL DEFAULT 'touchpoint',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.sla_regras TO service_role;
ALTER TABLE public.sla_regras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sla_service_role" ON public.sla_regras FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER sla_updated_at BEFORE UPDATE ON public.sla_regras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.sla_regras (chave, rotulo, descricao, horas_alvo, aplica_a) VALUES
  ('resposta_whatsapp', 'Resposta no WhatsApp', 'Responder mensagem recebida do cliente', 4, 'touchpoint'),
  ('retorno_call', 'Retorno pós-call', 'Enviar resumo e próximos passos após a chamada', 24, 'touchpoint'),
  ('discovery_followup', 'Follow-up de discovery', 'Devolutiva inicial após discovery', 72, 'touchpoint'),
  ('microentrega_prazo', 'Prazo de microentrega', 'Concluir microentrega planejada', 120, 'microentrega'),
  ('tarefa_planner', 'Tarefa do planner', 'Concluir tarefa aberta do planner', 96, 'planner');