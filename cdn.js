(function() {
  window.onload = (event) => {
    window.addEventListener("keydown", (event) => {
      if (event.altKey) {
        window.parent.focus();
      }
    });
  };
})();
