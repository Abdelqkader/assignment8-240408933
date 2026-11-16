const statusLine = document.querySelector('#status-line');
const output = document.querySelector('#output');
const buttons = document.querySelectorAll('button[data-path]');

function showResult(text, body, ok) {
  statusLine.textContent = text;
  statusLine.className = ok ? 'ok' : 'error';
  output.textContent = body;
}

async function callRoute(path, method) {
  showResult(`${method} ${path} ...`, '', true);

  try {
    // Relative URL: the request goes to the same server that sent this page.
    const response = await fetch(path, { method });

    // Read the body as text first, then try to pretty-print it as JSON.
    const text = await response.text();
    let body = text;
    try {
      body = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      // Not JSON (for example the HTML 404 page): show the text as it is.
    }

    showResult(
      `${method} ${path} -> ${response.status} ${response.statusText}`,
      body,
      response.ok,
    );
  } catch (error) {
    // fetch only rejects on network errors (server stopped, no connection).
    showResult(`${method} ${path} -> request failed`, error.message, false);
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const method = button.dataset.method ?? 'GET';
    callRoute(button.dataset.path, method);
  });
});
