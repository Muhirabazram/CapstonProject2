document.addEventListener('DOMContentLoaded', () => {
  // Navigation functionality
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  const viewSections = document.querySelectorAll('.view-section');

  if (navLinks.length > 0 && viewSections.length > 0) {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        // Add active class to clicked link
        link.classList.add('active');
        
        // Get target view
        const targetId = link.getAttribute('data-target');
        
        // Hide all views
        viewSections.forEach(view => {
          view.classList.remove('active');
        });
        
        // Show target view
        const targetView = document.getElementById(targetId);
        if (targetView) {
          targetView.classList.add('active');
        }
      });
    });
  }

  // Modal Functionality
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const modalCloses = document.querySelectorAll('[data-modal-close]');
  const overlays = document.querySelectorAll('.modal-overlay');

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('data-modal-target');
      const targetModal = document.getElementById(targetId);
      if (targetModal) {
        targetModal.classList.add('active');
      }
    });
  });

  modalCloses.forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      const modal = closeBtn.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('active');
      }
    });
  });

  overlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Login Form Submission simulation
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const role = document.getElementById('roleSelect').value;
      
      // Simulate loading state
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerText;
      submitBtn.innerText = 'Memproses...';
      submitBtn.disabled = true;

      setTimeout(() => {
        if (role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'mahasiswa-dashboard.html';
        }
      }, 1000); // 1 second simulated delay
    });
  }
});
