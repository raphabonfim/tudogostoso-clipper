browser.runtime.onMessage.addListener((message) => {
  if (message.type === "clipRecipe") {
    if (!message.content) {
      return;
    }

    navigator.clipboard.writeText(message.content).then(() => {
      try {
        browser.notifications.create({
          type: "basic",
          title: "Receita Copiada!",
          message: "Markdown colado na área de transferência",
          iconUrl: browser.runtime.getURL("icon.png")
        });
      } catch (e) {
        console.log("Notificações não suportadas");
      }
    }).catch(err => {
      console.error('Erro ao copiar:', err);
    });
  }
});