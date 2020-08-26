const uploadInput = document.querySelector('#file');
const contentTypeInput = document.querySelector('#content-type');
uploadInput.addEventListener('change', function(evt) {
  evt.preventDefault();
  const file = evt.target.files[0];
  contentTypeInput.value = file.type;
});
