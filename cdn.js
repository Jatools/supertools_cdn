function() {
  window.onload = (event) => {
    console.log("cdn works");
    window.addEventListener("keydown", (event) => {
      if (event.altKey) {
        window.parent.focus();
      }
    });
  };
});
