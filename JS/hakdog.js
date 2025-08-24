// Add interactivity if needed
// Example: Accept/Decline join request

document.addEventListener('DOMContentLoaded', function() {
  const acceptBtn = document.querySelector('.join-request button:first-of-type');
  const declineBtn = document.querySelector('.join-request button:last-of-type');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function() {
      alert('Request accepted!');
    });
  }
  if (declineBtn) {
    declineBtn.addEventListener('click', function() {
      alert('Request declined.');
    });
  }
});
