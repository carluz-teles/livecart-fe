export interface MarketingSection {
  id: string
  title: string
  paragraphs: string[]
  items?: string[]
}

export interface MarketingArticle {
  path: string
  category: "Integrações" | "Recursos" | "Guias" | "Casos reais" | "LiveCart"
  title: string
  description: string
  updated: string
  sections: MarketingSection[]
  related: string[]
  status?: string
}

const updated = "2026-10-20"
const integrationLinks = ["/integracoes/tiny", "/integracoes/bling", "/recursos/reserva-estoque"]

export const marketingArticles: MarketingArticle[] = [
  {
    path: "/integracoes/tiny", category: "Integrações", updated,
    title: "Pedidos das lives do Instagram conectados ao Tiny (Olist)",
    description: "Importe produtos do Tiny, acompanhe estoque e envie pedidos da live ao ERP. Entenda a reserva, os modos de envio e como conectar sua conta.",
    sections: [
      { id: "catalogo", title: "Seu catálogo começa no Tiny", paragraphs: ["Conecte a conta da loja e escolha os produtos que quer importar. O LiveCart aproveita os dados disponíveis no ERP, como nome, preço, imagens, variações e estoque. Cada produto recebe um código para ser divulgado na live.", "Atualizações recebidas do Tiny mantêm o catálogo conectado. A autorização da conta e os webhooks precisam estar ativos; uma falha na conexão pode atrasar o sincronismo."] },
      { id: "pedidos", title: "Quando o pedido chega ao ERP", paragraphs: ["No modo de reserva nativa, o primeiro item cria um pedido de venda no Tiny e os próximos itens atualizam esse pedido. No modo local, a reserva fica no LiveCart e o envio acontece na preparação do pagamento pelo checkout.", "O contato da cliente e os dados do fechamento acompanham o fluxo do pedido. Alterações em pedidos já faturados ou financeiramente encerrados dependem das regras do Tiny. Uma pendência de sincronização deve ser resolvida antes de considerar o pedido concluído."] },
      { id: "estoque", title: "Reserva no Tiny exige configuração no Tiny", paragraphs: ["O modo nativo usa o pedido de venda para reservar. Para que isso reduza a disponibilidade para outros canais, confira se a Reserva de Estoque está habilitada na sua conta Tiny.", "No modo local, outros canais ligados ao ERP não enxergam a reserva da live antes do envio do pedido. Para peças únicas vendidas em vários canais, essa diferença precisa ser verificada antes da transmissão."] },
      { id: "conectar", title: "Como conectar", paragraphs: ["No LiveCart, abra Configurações → Integrações → Tiny. A tela informa os endereços de redirecionamento e de webhooks específicos da sua conexão."], items: ["Na conta Tiny, confira o acesso a Aplicativos e Webhooks. A disponibilidade depende da sua conta.", "Crie o aplicativo usando o endereço de redirecionamento exibido pelo LiveCart e as permissões indicadas pelo conector.", "Informe as credenciais somente no formulário da integração e conclua a autorização no Tiny.", "Configure os webhooks com o endereço exibido, importe uma amostra do catálogo e confira o modo de reserva.", "Antes da primeira live, teste um pedido, sua alteração e o fechamento na operação da loja."] },
      { id: "fechamento", title: "Pagamento, nota e fechamento depois da live", paragraphs: ["A integração acompanha pedidos vinculados ao LiveCart. Pagamentos e situações do ERP são conciliados conforme os dados disponíveis; um pedido faturado não é, por si só, prova de quitação.", "A emissão de nota fiscal continua no ERP. Para uma operação com cobrança ou frete combinados diretamente, alinhe o modo de envio, os prazos e a conferência dos pedidos com a equipe antes da live."] },
    ], related: ["/integracoes/bling", "/recursos/fechamento-pos-live", "/casos/maricelia-decor"],
  },
  {
    path: "/integracoes/bling", category: "Integrações", updated,
    title: "LiveCart e Bling: catálogo, estoque e pedidos da live",
    description: "Veja o que a integração com Bling faz, como a reserva funciona e o passo a passo de instalação do aplicativo.",
    sections: [], related: ["/integracoes/tiny", "/recursos/reserva-estoque"],
  },
  {
    path: "/integracoes/nuvemshop", category: "Integrações", updated, status: "Em implantação",
    title: "LiveCart e Nuvemshop",
    description: "Acompanhe a implantação da integração LiveCart com Nuvemshop e saiba o que confirmar antes de usar o fluxo na sua loja.",
    sections: [
      { id: "disponibilidade", title: "Confirme a disponibilidade para sua loja", paragraphs: ["A integração com Nuvemshop está em implantação. Entre em contato com a equipe para confirmar a liberação e o escopo disponível para sua conta antes de planejar uma live com esse fluxo.", "A presença da Nuvemshop no catálogo de integrações não significa que todos os recursos estejam liberados. Esta página será atualizada conforme as etapas forem disponibilizadas."] },
      { id: "validacao", title: "O que conferir na demonstração", paragraphs: ["Traga o cenário da sua operação para validar o caminho completo, do código do produto ao fechamento."], items: ["Como produtos e variações da loja são identificados na live.", "Onde o estoque é controlado e quando uma peça fica reservada.", "Em qual checkout a compradora informa os dados e paga.", "Como acompanhar alterações, cancelamentos e entrega.", "Quais recursos estão liberados no seu plano e na sua conta."] },
    ], related: ["/integracoes", "/demonstracao", "/precos"],
  },
  {
    path: "/integracoes/instagram", category: "Integrações", updated,
    title: "Do código comentado no Instagram ao carrinho",
    description: "Entenda como o LiveCart identifica códigos nas lives, posts, Stories e Direct e organiza os produtos de cada cliente.",
    sections: [
      { id: "codigo", title: "O produto é identificado pelo código", paragraphs: ["Você apresenta um produto cadastrado com seu código numérico, como 1001. A cliente comenta 1001 para uma unidade ou 2x 1001 para duas. O LiveCart identifica o produto e processa o item no carrinho.", "Uma frase como ‘quero o preto’ não identifica automaticamente uma variação. Divulgue o código da opção correta. As dúvidas das clientes continuam com a equipe da loja."] },
      { id: "canais", title: "Lives e outros pontos de contato", paragraphs: ["Além das lives, o fluxo por código pode atender comentários de posts, respostas a Stories e Direct, conforme a configuração dos canais. Os itens são organizados por cliente dentro das regras do evento e do carrinho."] },
      { id: "conexao", title: "Conexão e envio do link", paragraphs: ["A loja precisa conectar uma conta profissional compatível e autorizar os acessos solicitados no fluxo do Instagram. Depois de conectar, confira o recebimento dos comentários e teste o envio do link pelo Direct.", "A entrega de mensagens depende das permissões, condições da conta e limites do Instagram. A plataforma mostra o processamento do pedido para a equipe acompanhar situações que precisam de atenção."] },
    ], related: ["/guias/pedidos-por-codigo", "/demonstracao", "/recursos/reserva-estoque"],
  },
  {
    path: "/integracoes/whatsapp", category: "Integrações", updated,
    title: "WhatsApp para comunicação e recuperação de carrinhos",
    description: "Conheça o uso de WhatsApp no LiveCart: mensagens configuradas, templates e acompanhamento da entrega na comunicação com clientes.",
    sections: [
      { id: "uso", title: "Continue o atendimento depois do comentário", paragraphs: ["O conector de WhatsApp utiliza Twilio para enviar mensagens configuradas pela loja, incluindo comunicações de recuperação de carrinho. O envio exige uma integração ativa, remetente configurado e templates aprovados quando aplicável.", "A captura de pedidos apresentada pelo LiveCart usa códigos no Instagram. Esta integração de WhatsApp não deve ser confundida com leitura automática de pedidos em grupos."] },
      { id: "condicoes", title: "O que preparar", paragraphs: ["Confira os contatos disponíveis, as regras de envio, a aprovação dos templates e os custos do provedor. Solicitações de descadastro e estados de entrega fazem parte do fluxo de comunicação.", "Uma mensagem enviada não garante leitura ou compra. A equipe deve acompanhar o retorno e manter um canal de atendimento com a cliente."] },
    ], related: ["/recursos/fechamento-pos-live", "/integracoes/instagram", "/precos"],
  },
  ...[
    { slug: "pagarme", name: "Pagar.me", details: "A integração utiliza a conta Pagar.me configurada pela loja para processar pagamentos no checkout do LiveCart." },
    { slug: "mercado-pago", name: "Mercado Pago", details: "A integração conecta a conta Mercado Pago da loja ao fluxo de pagamento do checkout." },
  ].map(({ slug, name, details }): MarketingArticle => ({
    path: `/integracoes/${slug}`, category: "Integrações", updated,
    title: `${name} no checkout do LiveCart`,
    description: `Receba pelo ${name} no checkout dos pedidos da live. Confira configuração, confirmação do pagamento e custos do provedor.`,
    sections: [
      { id: "pagamento", title: "Da live ao pagamento", paragraphs: [details, "Após reunir os produtos, a compradora abre o carrinho e segue para o pagamento. Pix e cartão dependem das modalidades habilitadas na conta e no checkout da loja."] },
      { id: "confirmacao", title: "Confirmação e acompanhamento", paragraphs: ["O status retornado pelo provedor permite acompanhar pagamentos pendentes, aprovados ou recusados. A confirmação também alimenta o fechamento do pedido e os sistemas conectados, conforme a configuração da loja.", "A disponibilidade de parcelamento, prazos de recebimento e tarifas segue o contrato da loja com o provedor. A mensalidade do LiveCart não substitui essas cobranças."] },
      { id: "preparar", title: "Antes de divulgar o checkout", paragraphs: ["Conecte a conta em Configurações → Integrações, habilite as modalidades desejadas e teste o fluxo de compra. Confira preço, frete, dados do destinatário e a confirmação no painel.", "Para cancelamentos e reembolsos, confira o estado do pagamento e as ações permitidas pelo provedor antes de atualizar a operação."] },
    ], related: ["/precos", "/recursos/fechamento-pos-live", "/demonstracao"],
  })),
  ...[
    { slug: "melhor-envio", name: "Melhor Envio" },
    { slug: "smartenvios", name: "SmartEnvios" },
  ].map(({ slug, name }): MarketingArticle => ({
    path: `/integracoes/${slug}`, category: "Integrações", updated,
    title: `Frete com ${name} no LiveCart`,
    description: `Conecte ${name} para cotar frete no fluxo dos pedidos da live e saiba quais dados preparar para a entrega.`,
    sections: [
      { id: "cotacao", title: "A entrega entra no fechamento do pedido", paragraphs: [`A integração com ${name} permite consultar as opções de frete disponíveis para a combinação de origem, destino e produtos. A compradora encontra as opções habilitadas no checkout da loja.`, "A cotação depende de CEP, peso, dimensões e serviços disponíveis na sua conta. Dados incompletos podem impedir a apresentação de uma opção de entrega."] },
      { id: "configuracao", title: "Prepare o cadastro da loja e dos produtos", paragraphs: ["Conecte a conta do provedor, revise o endereço de origem e os dados de envio dos produtos. Se o catálogo vem do ERP, confira se as medidas importadas correspondem à embalagem utilizada.", "Tarifas, cobertura, prazos e condições de postagem pertencem ao serviço contratado. Confirme as etapas de etiqueta e expedição disponíveis no seu fluxo antes de operar."] },
      { id: "manual", title: "Sua loja combina o frete diretamente?", paragraphs: ["O fechamento pode fazer parte do atendimento da equipe, conforme a configuração da operação. Nesse caso, organize os pedidos e alinhe entrega e cobrança com a cliente antes da conclusão. Não apresente uma cotação automática como obrigatória para todo modelo de venda."] },
    ], related: ["/recursos/fechamento-pos-live", "/casos/canto-da-art", "/integracoes"],
  })),
  {
    path: "/recursos/reserva-estoque", category: "Recursos", updated,
    title: "Reserva de estoque e fila de espera nas lives",
    description: "Entenda quem segura a peça entre o comentário e o pagamento, como a fila funciona e o que conferir se você vende em outros canais.",
    sections: [
      { id: "disponibilidade", title: "Uma peça disponível precisa ter um destino", paragraphs: ["Quando um código é processado, o LiveCart considera a disponibilidade do produto para adicionar a quantidade ao carrinho. A reserva organiza a disputa pelos itens durante o evento; ela não equivale a um pagamento aprovado.", "Para comentários simultâneos, a ordem de processamento e as regras de disponibilidade orientam a alocação. A ordem visual exibida no aplicativo do Instagram não deve ser usada como garantia de prioridade entre sistemas."] },
      { id: "modos", title: "Reserva local e reserva no ERP", paragraphs: ["No modo local, a disponibilidade é controlada no LiveCart e o pedido chega ao ERP na preparação do pagamento. Outros canais que usam apenas o ERP não enxergam essa reserva enquanto ela permanecer local.", "No modo nativo, o pedido é enviado durante a live. O ERP só reserva de fato quando sua conta e suas situações de venda estão configuradas para isso. Tiny e Bling têm requisitos próprios; confira o modo efetivo exibido na integração."] },
      { id: "fila", title: "Quando o produto acaba", paragraphs: ["Pedidos sem disponibilidade podem entrar na fila de espera. Quando uma quantidade volta a ficar disponível, o LiveCart processa a fila e as notificações conforme as regras do evento.", "A fila não garante uma compra futura. Quantidade, validade, situação do carrinho e confirmação da integração precisam continuar válidas para a reserva ser aproveitada."] },
      { id: "prazos", title: "Encerrar a live e expirar o carrinho são etapas distintas", paragraphs: ["Configure o período do evento e o prazo de fechamento dos carrinhos. Se a cliente vai pagar depois da transmissão, confira o prazo exibido antes de divulgar o link.", "Antes de vender peças únicas em vários canais, teste a reserva no ERP e a atualização de disponibilidade nos demais canais da loja."] },
    ], related: [...integrationLinks.slice(0, 2), "/guias/pecas-unicas-na-live"],
  },
  {
    path: "/recursos/fechamento-pos-live", category: "Recursos", updated,
    title: "Organize os pedidos e feche as vendas depois da live",
    description: "Reúna os itens por cliente, defina os prazos dos carrinhos e escolha o fechamento com checkout ou atendimento da sua equipe.",
    sections: [
      { id: "carrinho", title: "Os comentários alimentam o carrinho da cliente", paragraphs: ["A cliente pode comentar vários códigos durante o evento. Os produtos são reunidos no carrinho correspondente conforme as regras da loja, evitando montar uma lista separada para cada comentário.", "Depois da transmissão, a equipe confere itens, disponibilidade e pendências. Pedidos, carrinhos e pagamentos têm estados próprios: um carrinho aberto ainda precisa ser fechado."] },
      { id: "checkout", title: "Fechamento pelo checkout", paragraphs: ["A compradora acessa seu link, confere os produtos e preenche os dados necessários para entrega e pagamento. Frete e meios de pagamento dependem das integrações habilitadas pela loja.", "O link deve continuar válido pelo prazo combinado. Confirme os dias de pagamento após o encerramento do evento e as exceções aplicáveis aos carrinhos."] },
      { id: "atendimento", title: "Fechamento com atendimento da loja", paragraphs: ["Para operações que combinam frete e cobrança diretamente, o LiveCart organiza a captura dos pedidos e a equipe conduz o fechamento. Essa operação precisa ser alinhada ao modo de envio ao ERP; o modo local envia no fluxo de checkout.", "Confira pagamentos efetivamente recebidos e atualizações de itens antes de finalizar. A existência de um pedido no Tiny ou no Bling não significa que ele já foi pago."] },
      { id: "conferencia", title: "Uma conferência antes de separar os produtos", paragraphs: ["Abra os pedidos da operação e confira os pontos que afetam separação, entrega e cobrança."], items: ["Itens e quantidades confirmados, incluindo reservas e fila.", "Pagamento confirmado ou atendimento ainda pendente.", "Frete e endereço combinados com a compradora.", "Prazo de fechamento e situação do evento.", "Sincronização com o ERP sem pendências que alterem o pedido."] },
    ], related: ["/guias/organizar-pedidos-pos-live", "/casos/canto-da-art", "/integracoes/tiny"],
  },
  {
    path: "/guias/pedidos-por-codigo", category: "Guias", updated,
    title: "Como transformar comentários com código em pedidos",
    description: "Prepare catálogo, códigos e evento para captar pedidos nas lives do Instagram. Um roteiro prático da apresentação ao carrinho.",
    sections: [
      { id: "antes", title: "1. Prepare o catálogo antes de entrar ao vivo", paragraphs: ["Importe ou cadastre os produtos e confira o código de cada item. Use um código diferente para cada opção que precisa ser identificada separadamente, como uma variação de tamanho. Revise preço e disponibilidade."] },
      { id: "explicar", title: "2. Explique a regra às clientes", paragraphs: ["Mostre o código junto do produto e repita a instrução: 1001 para uma unidade; 2x 1001 para duas. Se alguém pedir ‘quero o preto’, informe o código correspondente. Uma descrição livre não substitui o código cadastrado."] },
      { id: "acompanhar", title: "3. Acompanhe a captura durante a live", paragraphs: ["Confira no painel se os comentários estão chegando e se o item foi adicionado. Indisponibilidade, evento encerrado ou conexão pendente exigem atenção. Pedir que a cliente repita o comentário sem verificar o carrinho pode criar confusão de quantidade."] },
      { id: "finalizar", title: "4. Combine como e quando fechar", paragraphs: ["Informe se a cliente deve abrir o link de checkout ou aguardar atendimento da loja. Confira o prazo do carrinho e o modo de envio ao ERP. Encerre a transmissão com uma orientação clara sobre pagamento e entrega."] },
    ], related: ["/integracoes/instagram", "/demonstracao", "/guias/organizar-pedidos-pos-live"],
  },
  {
    path: "/guias/organizar-pedidos-pos-live", category: "Guias", updated,
    title: "Como organizar os pedidos depois da live do Instagram",
    description: "Uma sequência para conferir carrinhos, pagamentos, frete e pedidos no ERP quando sua loja fecha as vendas após a transmissão.",
    sections: [
      { id: "prazo", title: "Comece pelo prazo que você combinou", paragraphs: ["O fim da transmissão não precisa ser o fim do prazo de pagamento. Configure o evento e os dias de fechamento antes da live. Ao encerrar, revise o resumo dos prazos para evitar liberar uma reserva enquanto a cliente ainda está dentro do combinado."] },
      { id: "conferir", title: "Confira os pedidos por cliente", paragraphs: ["Revise produtos, quantidades e itens em espera. Confira comentários repetidos antes de alterar a quantidade e resolva divergências de sincronização. Uma visualização do ERP e outra do carrinho ajudam a identificar o que ainda precisa ser confirmado."] },
      { id: "cobrar", title: "Defina uma rotina de cobrança e entrega", paragraphs: ["Se usa checkout, envie o link válido e acompanhe o pagamento. Se combina manualmente, confirme frete e total com a cliente e registre o fechamento no fluxo da loja. Não trate pedido criado ou nota emitida como confirmação automática de recebimento."] },
      { id: "separar", title: "Separe após conferir o estado da venda", paragraphs: ["Use a lista final de itens confirmados. Quando há cancelamento ou expiração, acompanhe a liberação de estoque e o processamento da fila antes de oferecer novamente a peça. Deixe claro quem da equipe cuida de cobrança, separação e expedição."] },
    ], related: ["/recursos/fechamento-pos-live", "/casos/canto-da-art", "/integracoes/tiny"],
  },
  {
    path: "/guias/pecas-unicas-na-live", category: "Guias", updated,
    title: "Como vender peças únicas em live com controle de reserva",
    description: "O que conferir na disputa pela última unidade, na fila de espera e no estoque compartilhado com outros canais.",
    sections: [
      { id: "saldo", title: "Confira o saldo disponível", paragraphs: ["Uma unidade no estoque físico pode já estar comprometida com outro pedido. Antes de anunciar, confira o saldo disponível e a conexão com o ERP. Use o código da peça ou da variação exata."] },
      { id: "canais", title: "Entenda quem enxerga a reserva", paragraphs: ["Se a reserva é local, outro canal conectado apenas ao ERP pode continuar oferecendo a peça. Para compartilhar a reserva entre canais, valide o modo nativo e a configuração do ERP. O LiveCart não habilita por conta própria o módulo de reserva do fornecedor."] },
      { id: "teste", title: "Teste o cenário de disputa", paragraphs: ["Em um teste controlado, faça dois pedidos da última unidade e confira quem recebeu a reserva, quem ficou em espera e o que aconteceu no ERP. Não prometa prioridade pela ordem visual dos comentários no Instagram."] },
      { id: "retorno", title: "Acompanhe a volta da disponibilidade", paragraphs: ["Simule cancelamento e fim de prazo usando dados de teste. Confira a fila e a nova reserva antes de anunciar a peça de novo. A notificação depende do canal de comunicação e não é garantia de pagamento."] },
    ], related: integrationLinks,
  },
  {
    path: "/guias/live-com-tiny-ou-bling", category: "Guias", updated,
    title: "Como conectar pedidos de lives ao Tiny ou Bling",
    description: "Compare as etapas de catálogo, reserva, criação de pedidos e fechamento para preparar sua operação com ERP.",
    sections: [
      { id: "catalogo", title: "Mantenha uma origem clara para o catálogo", paragraphs: ["Conecte o ERP da loja, importe uma amostra e confira códigos, variações, preços e saldo. A integração atende a conta configurada para a loja; não é uma migração automática entre Tiny e Bling."] },
      { id: "reserva", title: "Escolha o modo pelo seu fluxo de venda", paragraphs: ["No modo nativo, o pedido é enviado durante a captura da live. No local, o envio ocorre na preparação do pagamento. Confira a reserva na conta do ERP e os efeitos nos outros canais antes de decidir."] },
      { id: "fechamento", title: "Faça uma venda de teste de ponta a ponta", paragraphs: ["Confira comentário, item, contato, pedido remoto, pagamento e entrega. Depois teste a alteração de quantidade e um cancelamento permitido. Pedidos faturados ou encerrados podem restringir alterações."] },
      { id: "criterios", title: "O que exigir de uma integração", paragraphs: ["Na demonstração, procure respostas específicas em vez de apenas o nome ou logo do ERP."], items: ["Quais dados são importados e em qual direção são atualizados?", "Quando o pedido nasce e quem reserva o estoque?", "Como uma falha ou atraso de sincronização aparece para a equipe?", "Qual estado comprova pagamento?", "Como notas e expedição são acompanhadas?"] },
    ], related: [...integrationLinks.slice(0, 2), "/demonstracao"],
  },
  {
    path: "/casos/canto-da-art", category: "Casos reais", updated,
    title: "Canto da Art: pedidos organizados e fechamento com atendimento",
    description: "Conheça o modelo de operação da Canto da Art: pedidos das lives, integração com Tiny e frete combinado diretamente com a cliente.",
    sections: [
      { id: "operacao", title: "O atendimento faz parte da venda", paragraphs: ["A Canto da Art utiliza o LiveCart conectado ao Tiny. Na operação informada pela loja, o contato para o fechamento e a combinação do frete são feitos manualmente, sem depender do checkout para todas as vendas."] },
      { id: "fluxo", title: "Da captura à conferência", paragraphs: ["Os códigos permitem organizar os produtos nos carrinhos das clientes. A equipe acompanha os pedidos e conduz a combinação de entrega e cobrança. A integração com o Tiny participa da gestão dos produtos e dos pedidos vinculados à operação."] },
      { id: "aprendizado", title: "O que considerar em uma operação parecida", paragraphs: ["Defina o prazo de fechamento, confira o modo de envio ao ERP e combine quem cuida de cada atendimento. A escolha do fluxo precisa acompanhar a forma como a loja já vende.", "Este caso descreve o processo utilizado. Não apresenta ganho percentual de vendas, promessa de resultado ou depoimento atribuído à loja."] },
    ], related: ["/recursos/fechamento-pos-live", "/integracoes/tiny", "/guias/organizar-pedidos-pos-live"],
  },
  {
    path: "/casos/maricelia-decor", category: "Casos reais", updated,
    title: "Maricelia Decor: catálogo no Tiny e carrinhos por cliente",
    description: "Como a operação da Maricelia Decor conecta produtos do Tiny e organiza os pedidos das clientes em eventos de venda.",
    sections: [
      { id: "operacao", title: "Produtos e pedidos conectados ao ERP", paragraphs: ["A Maricelia Decor utiliza o LiveCart com integração ao Tiny para organizar seu catálogo e os pedidos vinculados aos carrinhos. A operação trabalha com eventos e acompanhamento do fechamento por cliente."] },
      { id: "prazo", title: "O prazo continua depois do evento", paragraphs: ["O período de captura e o prazo para fechar os carrinhos são decisões separadas. Na operação acompanhada, o evento mantém uma janela de fechamento após o encerramento, permitindo à equipe acompanhar os pedidos pendentes."] },
      { id: "aprendizado", title: "O que essa operação ajuda a visualizar", paragraphs: ["Quem já usa um ERP pode preparar o catálogo, divulgar códigos e acompanhar os pedidos por cliente dentro de um evento. Antes da live, o cuidado principal é conferir reserva, conexão e prazo de fechamento.", "O caso descreve o fluxo observado, sem divulgar dados das compradoras ou atribuir aumentos de conversão que não foram medidos."] },
    ], related: ["/integracoes/tiny", "/recursos/reserva-estoque", "/recursos/fechamento-pos-live"],
  },
  {
    path: "/sobre", category: "LiveCart", updated,
    title: "LiveCart: pedidos por código para quem vende no Instagram",
    description: "Conheça a LiveCart, plataforma brasileira que conecta comentários com códigos, carrinhos e a operação da loja.",
    sections: [
      { id: "produto", title: "Uma operação que começa no comentário", paragraphs: ["A LiveCart é uma plataforma para lojistas que vendem pelo Instagram e em lives. O código divulgado identifica o produto, os itens são organizados por cliente e as integrações conectam o fluxo ao pagamento, ao ERP e à entrega."] },
      { id: "empresa", title: "Quem está por trás", paragraphs: ["LiveCart é uma solução da Dahlemtech Solutions Ltda, CNPJ 54.350.351/0001-51. Nosso domínio é livecart.com.br e o painel da plataforma fica em app.livecart.com.br.", "Para conhecer a operação ou esclarecer dúvidas de integração, fale com a equipe pelo e-mail eng@livecart.com.br ou pelo atendimento da página inicial."] },
    ], related: ["/integracoes", "/casos", "/precos"],
  },
]

export function findMarketingArticle(path: string) {
  return marketingArticles.find((article) => article.path === path)
}
