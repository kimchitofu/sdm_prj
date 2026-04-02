// FundBridge Main JavaScript

// Auto-dismiss flash messages after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            bsAlert.close();
        }, 5000);
    });
});

// Image preview on file input change
document.addEventListener('DOMContentLoaded', function() {
    const fileInputs = document.querySelectorAll('input[type="file"][accept="image/*"]');
    fileInputs.forEach(function(input) {
        input.addEventListener('change', function(e) {
            const preview = document.getElementById('image-preview');
            if (preview && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    preview.src = ev.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    });
});

// Confirm delete actions
document.addEventListener('DOMContentLoaded', function() {
    const confirmForms = document.querySelectorAll('form[data-confirm]');
    confirmForms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            if (!confirm(form.dataset.confirm)) {
                e.preventDefault();
            }
        });
    });
});
