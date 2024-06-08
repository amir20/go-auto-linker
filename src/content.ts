const pattern = /go\/[^ ]+/g;

const replacePattern = (node: Node, children = true) => {
  if (node instanceof HTMLElement && node.getAttribute("injected") === "true") {
    return;
  }
  if (node.nodeType === 3 && node.nodeValue) {
    const matches = node.nodeValue.match(pattern);
    if (matches) {
      const span = document.createElement("span");
      span.setAttribute("injected", "true");
      let lastIndex = 0;
      matches.forEach((match) => {
        if (!node.nodeValue) return;
        const index = node.nodeValue.indexOf(match, lastIndex);
        if (index > lastIndex) {
          span.appendChild(
            document.createTextNode(node.nodeValue.slice(lastIndex, index))
          );
        }
        const a = document.createElement("a");
        a.href = "http://" + match;
        a.textContent = match;
        span.appendChild(a);
        lastIndex = index + match.length;
      });
      span.appendChild(
        document.createTextNode(node.nodeValue.slice(lastIndex))
      );
      node.parentNode?.replaceChild(span, node);
    }
  } else if (
    children &&
    node.nodeType === 1 &&
    node.nodeName !== "SCRIPT" &&
    node.nodeName !== "STYLE"
  ) {    
    Array.from(node.childNodes).forEach((node) =>
      replacePattern(node, children)
    );
  }
};

replacePattern(document.body);

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      replacePattern(node);
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });