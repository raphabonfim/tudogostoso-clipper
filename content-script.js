function decodeHTML(html) {
  // Passo 1: Converter entidades numéricas e nominais
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&ccedil;': 'ç',
    '&atilde;': 'ã',
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&nbsp;': ' '
  };

  // Passo 2: Substituir entidades conhecidas
  let decoded = html.replace(/&[a-z]+;/g, match => entities[match] || match);

  // Passo 3: Decodificação avançada usando div
  const temp = document.createElement('div');
  temp.innerHTML = decoded;
  return temp.textContent || temp.innerText;
}

function extractRecipe() {
  try {
    const script = document.querySelector('script[type="application/ld+json"]');
    if (!script) return null;

    const rawData = script.innerHTML
      .replace(/<\/?script>/g, '')
      .replace(/\\\\/g, '\\');

    const recipeData = JSON.parse(rawData);
    if (!recipeData['@type']?.includes('Recipe')) return null;

    let markdown = `# ${decodeHTML(recipeData.name)}\n\n## Ingredientes\n`;
    
    // Processar ingredientes
    recipeData.recipeIngredient.forEach(ingredient => {
      markdown += `- ${decodeHTML(ingredient)}\n`;
    });

    // Processar modo de preparo
    markdown += '\n## Modo de Preparo\n';
    recipeData.recipeInstructions.forEach((step, index) => {
      const text = decodeHTML(step.text)
        .replace(/(\r\n|\n|\r)/gm, " ") // Remover quebras de linha
        .replace(/\s+/g, ' ') // Espaços múltiplos
        .trim();
        
      markdown += `${index + 1}. ${text}\n`;
    });

    // Metadados adicionais
    markdown += `\n**Rendimento:** ${recipeData.recipeYield}\n`;
    markdown += `**Tempo Total:** ${recipeData.totalTime.replace('PT', '').replace('H', 'h').replace('M', 'min')}\n`;
    markdown += `\n_Fonte: [${recipeData.name}](${window.location.href})_`;

    return markdown;

  } catch (error) {
    console.error('Erro na extração:', error);
    return null;
  }
}

// Disparar quando a página estiver pronta
if (document.readyState === 'complete') {
  browser.runtime.sendMessage({ type: "clipRecipe", content: extractRecipe() });
} else {
  window.addEventListener('load', () => {
    browser.runtime.sendMessage({ type: "clipRecipe", content: extractRecipe() });
  });
}