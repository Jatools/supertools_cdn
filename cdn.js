(function() {
  window.onload = (event) => {
    window.addEventListener("keydown", (event) => {
      if (event.altKey) {
        console.log("worked");
        window.parent.focus();
      }
    });
  };
})();
