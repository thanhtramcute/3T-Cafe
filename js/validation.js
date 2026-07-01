/**
 * 3TCoffee - Form Validation v2.0
 * Comprehensive form validation with real-time feedback
 */

const Validation = {
    // ================================
    // RULES
    // ================================
    rules: {
        required: {
            validate: (value) => value.trim().length > 0,
            message: 'Trường này là bắt buộc'
        },
        email: {
            validate: (value) => {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return regex.test(value);
            },
            message: 'Email không hợp lệ'
        },
        phone: {
            validate: (value) => {
                const regex = /^(0[0-9]{9,10})$/;
                return regex.test(value.replace(/\s/g, ''));
            },
            message: 'Số điện thoại không hợp lệ (VD: 0912345678)'
        },
        password: {
            validate: (value) => value.length >= 6,
            message: 'Mật khẩu phải có ít nhất 6 ký tự'
        },
        passwordStrong: {
            validate: (value) => {
                const hasUpperCase = /[A-Z]/.test(value);
                const hasLowerCase = /[a-z]/.test(value);
                const hasNumber = /[0-9]/.test(value);
                const hasMinLength = value.length >= 8;
                return hasUpperCase && hasLowerCase && hasNumber && hasMinLength;
            },
            message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số'
        },
        confirmPassword: {
            validate: (value, form) => value === form.querySelector('input[name="password"]')?.value,
            message: 'Mật khẩu xác nhận không khớp'
        },
        minLength: (min) => ({
            validate: (value) => value.length >= min,
            message: `Ít nhất ${min} ký tự`
        }),
        maxLength: (max) => ({
            validate: (value) => value.length <= max,
            message: `Tối đa ${max} ký tự`
        }),
        min: (min) => ({
            validate: (value) => parseFloat(value) >= min,
            message: `Giá trị tối thiểu là ${min}`
        }),
        max: (max) => ({
            validate: (value) => parseFloat(value) <= max,
            message: `Giá trị tối đa là ${max}`
        }),
        numeric: {
            validate: (value) => !isNaN(parseFloat(value)) && isFinite(value),
            message: 'Vui lòng nhập số'
        },
        url: {
            validate: (value) => {
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }
            },
            message: 'URL không hợp lệ'
        },
        pattern: (regex, message) => ({
            validate: (value) => regex.test(value),
            message: message || 'Định dạng không hợp lệ'
        })
    },

    // ================================
    // VALIDATE SINGLE FIELD
    // ================================
    validateField: function(input, rules) {
        const value = input.value;
        const errors = [];

        // Skip validation if field is empty and not required
        const isRequired = rules.includes('required');
        if (!isRequired && !value) {
            this.setFieldState(input, null);
            return { valid: true, errors: [] };
        }

        // Check each rule
        for (const rule of rules) {
            let ruleConfig;
            let params = null;

            if (typeof rule === 'string') {
                ruleConfig = this.rules[rule];
            } else if (typeof rule === 'object' && rule.validate) {
                ruleConfig = rule;
            } else if (typeof rule === 'function') {
                ruleConfig = { validate: rule, message: 'Giá trị không hợp lệ' };
            }

            if (ruleConfig && !ruleConfig.validate(value)) {
                errors.push(ruleConfig.message);
            }
        }

        // Set field state
        const valid = errors.length === 0;
        this.setFieldState(input, valid, errors[0]);

        return { valid, errors };
    },

    // ================================
    // SET FIELD STATE
    // ================================
    setFieldState: function(input, valid, errorMessage = '') {
        // Remove existing states
        input.classList.remove('is-valid', 'is-invalid');
        
        // Get or create feedback element
        let feedback = input.parentElement.querySelector('.invalid-feedback');
        if (!feedback && input.type !== 'hidden') {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            input.parentElement.appendChild(feedback);
        }

        if (valid === null) {
            // Neutral state
            if (feedback) feedback.style.display = 'none';
        } else if (valid) {
            // Valid state
            input.classList.add('is-valid');
            if (feedback) feedback.style.display = 'none';
        } else {
            // Invalid state
            input.classList.add('is-invalid');
            if (feedback) {
                feedback.textContent = errorMessage;
                feedback.style.display = 'block';
            }
        }
    },

    // ================================
    // VALIDATE FORM
    // ================================
    validateForm: function(form, validationConfig) {
        let isValid = true;
        let firstInvalidField = null;

        for (const [fieldName, rules] of Object.entries(validationConfig)) {
            const input = form.querySelector(`[name="${fieldName}"]`) || 
                         form.querySelector(`#${fieldName}`);
            
            if (input) {
                const result = this.validateField(input, rules);
                if (!result.valid && isValid) {
                    isValid = false;
                    firstInvalidField = input;
                }
            }
        }

        // Focus first invalid field
        if (firstInvalidField) {
            firstInvalidField.focus();
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return isValid;
    },

    // ================================
    // PASSWORD STRENGTH
    // ================================
    getPasswordStrength: function(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        if (score <= 2) return { level: 'weak', text: 'Yếu', color: '#d63031' };
        if (score <= 4) return { level: 'medium', text: 'Trung bình', color: '#fdcb6e' };
        return { level: 'strong', text: 'Mạnh', color: '#00b894' };
    },

    // ================================
    // INIT REAL-TIME VALIDATION
    // ================================
    initRealtimeValidation: function(form, validationConfig) {
        for (const fieldName of Object.keys(validationConfig)) {
            const input = form.querySelector(`[name="${fieldName}"]`) ||
                         form.querySelector(`#${fieldName}`);
            
            if (input) {
                // Validate on blur
                input.addEventListener('blur', () => {
                    this.validateField(input, validationConfig[fieldName]);
                });

                // Validate on input (with debounce for better UX)
                let timeout;
                input.addEventListener('input', () => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        this.validateField(input, validationConfig[fieldName]);
                    }, 500);
                });
            }
        }
    }
};

// ================================
// VALIDATION CONFIGURATIONS
// ================================
const FormConfigs = {
    // Login form
    login: {
        email: ['required', 'email'],
        password: ['required']
    },

    // Register form
    register: {
        name: ['required', { minLength: 2 }, { maxLength: 50 }],
        email: ['required', 'email'],
        phone: ['required', 'phone'],
        password: ['required', 'passwordStrong'],
        confirmPassword: ['required', 'confirmPassword']
    },

    // Checkout form
    checkout: {
        name: ['required', { minLength: 2 }, { maxLength: 100 }],
        phone: ['required', 'phone'],
        address: ['required', { minLength: 10 }, { maxLength: 500 }]
    },

    // Contact form
    contact: {
        name: ['required', { minLength: 2 }],
        email: ['required', 'email'],
        subject: ['required'],
        message: ['required', { minLength: 10 }]
    },

    // Account form
    account: {
        name: ['required', { minLength: 2 }],
        phone: ['required', 'phone'],
        address: [{ minLength: 10 }]
    }
};

// ================================
// AUTO-INITIALIZE FORMS
// ================================
document.addEventListener('DOMContentLoaded', function() {
    // Find all forms with data-validate attribute
    document.querySelectorAll('form[data-validate]').forEach(form => {
        const configName = form.dataset.validate;
        const config = FormConfigs[configName];
        
        if (config) {
            Validation.initRealtimeValidation(form, config);
            
            form.addEventListener('submit', function(e) {
                if (!Validation.validateForm(form, config)) {
                    e.preventDefault();
                    App.toast.show('Vui lòng kiểm tra lại thông tin!', 'error');
                }
            });
        }
    });

    // Password strength indicator
    document.querySelectorAll('input[data-password-strength]').forEach(input => {
        const strengthContainer = document.createElement('div');
        strengthContainer.className = 'password-strength mt-2';
        strengthContainer.innerHTML = '<div class="password-strength-bar"></div><small class="text-muted"></small>';
        input.parentElement.appendChild(strengthContainer);

        input.addEventListener('input', function() {
            const strength = Validation.getPasswordStrength(this.value);
            strengthContainer.className = `password-strength ${strength.level}`;
            strengthContainer.querySelector('.password-strength-bar').style.width = 
                strength.level === 'weak' ? '33%' : 
                strength.level === 'medium' ? '66%' : '100%';
            strengthContainer.querySelector('small').textContent = 
                this.value ? `Độ mạnh: ${strength.text}` : '';
            strengthContainer.querySelector('small').style.color = strength.color;
        });
    });

    // Phone number formatting
    document.querySelectorAll('input[data-phone]').forEach(input => {
        input.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 4) {
                    value = value;
                } else if (value.length <= 7) {
                    value = value.slice(0, 4) + ' ' + value.slice(4);
                } else {
                    value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 10);
                }
            }
            this.value = value;
        });
    });

    // Character counter for textarea
    document.querySelectorAll('textarea[data-maxlength]').forEach(textarea => {
        const maxLength = parseInt(textarea.dataset.maxlength);
        const counter = document.createElement('small');
        counter.className = 'text-muted float-right';
        textarea.parentElement.appendChild(counter);

        const updateCounter = () => {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${textarea.value.length}/${maxLength}`;
            counter.style.color = remaining < 20 ? '#d63031' : '#636e72';
        };

        textarea.addEventListener('input', updateCounter);
        updateCounter();
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Validation, FormConfigs };
}
