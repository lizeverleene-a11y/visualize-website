/* CONTACTFORMULIER — verstuurt via Formspree (zelfde account als op de oude site) */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  // Vanaf "Bestel" bij de diensten: het juiste type project staat al aangeduid
  try {
    var dienst = new URLSearchParams(location.search).get('dienst');
    var keuze = document.getElementById('subject');
    if (dienst && keuze && keuze.querySelector('option[value="' + dienst + '"]')) keuze.value = dienst;
  } catch (e) {}
  var btn = document.getElementById('submit-btn');
  var status = document.getElementById('form-status');
  var label = btn.innerHTML;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    btn.textContent = 'Versturen...';
    btn.disabled = true;
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (res.ok) { window.location.href = form.dataset.bedankt || '/bedankt/'; return; }
        throw new Error('fout');
      })
      .catch(function () {
        status.textContent = 'Je bericht is niet verstuurd. Probeer het zo meteen opnieuw.';
        btn.innerHTML = label;
        btn.disabled = false;
      });
  });
})();
