/**
 * Universal Screen Popup Notification System for AlumniConnect
 */

(function () {
    // 1. Inject Styles if not present
    function injectPopupStyles() {
        if (document.getElementById('popup-custom-styles')) return;
        const style = document.createElement('style');
        style.id = 'popup-custom-styles';
        style.textContent = `
            .popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 99999;
                background-color: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1.25rem;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.25s ease-in-out;
            }
            .popup-overlay.active {
                opacity: 1;
                pointer-events: auto;
            }
            .popup-card {
                background: #ffffff;
                border-radius: 1.25rem;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
                width: 100%;
                max-width: 26rem;
                padding: 1.75rem;
                text-align: center;
                transform: scale(0.92) translateY(12px);
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
            }
            .popup-overlay.active .popup-card {
                transform: scale(1) translateY(0);
            }
            .popup-icon-badge {
                width: 4rem;
                height: 4rem;
                border-radius: 50%;
                margin: 0 auto 1.25rem auto;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.75rem;
                transition: all 0.2s ease;
            }
            .popup-icon-badge.success {
                background-color: #d1fae5;
                color: #059669;
            }
            .popup-icon-badge.error {
                background-color: #fee2e2;
                color: #dc2626;
            }
            .popup-icon-badge.warning {
                background-color: #fef3c7;
                color: #d97706;
            }
            .popup-icon-badge.info {
                background-color: #e0f2fe;
                color: #0284c7;
            }
            .popup-icon-badge.network {
                background-color: #ffe4e6;
                color: #e11d48;
            }
            .popup-title {
                font-size: 1.25rem;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 0.5rem;
                line-height: 1.3;
            }
            .popup-message {
                font-size: 0.938rem;
                color: #475569;
                line-height: 1.5;
                margin-bottom: 1.5rem;
                word-wrap: break-word;
            }
            .popup-action-html {
                margin-top: 0.5rem;
                margin-bottom: 1.25rem;
                font-size: 0.875rem;
            }
            .popup-buttons {
                display: flex;
                gap: 0.75rem;
                justify-content: center;
            }
            .popup-btn {
                padding: 0.65rem 1.35rem;
                border-radius: 0.75rem;
                font-weight: 600;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.15s ease;
                border: none;
                outline: none;
                flex: 1;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }
            .popup-btn-primary {
                background-color: #012970;
                color: #ffffff;
                box-shadow: 0 4px 12px rgba(1, 41, 112, 0.25);
            }
            .popup-btn-primary:hover {
                background-color: #011d54;
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(1, 41, 112, 0.35);
            }
            .popup-btn-danger {
                background-color: #dc2626;
                color: #ffffff;
                box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
            }
            .popup-btn-danger:hover {
                background-color: #b91c1c;
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(220, 38, 38, 0.35);
            }
            .popup-btn-secondary {
                background-color: #f1f5f9;
                color: #475569;
                border: 1px solid #e2e8f0;
            }
            .popup-btn-secondary:hover {
                background-color: #e2e8f0;
                color: #1e293b;
            }
            .popup-close-btn {
                position: absolute;
                top: 0.875rem;
                right: 0.875rem;
                background: transparent;
                border: none;
                color: #94a3b8;
                font-size: 1.125rem;
                cursor: pointer;
                padding: 0.35rem 0.5rem;
                line-height: 1;
                border-radius: 0.5rem;
                transition: color 0.15s ease, background-color 0.15s ease;
            }
            .popup-close-btn:hover {
                color: #334155;
                background-color: #f1f5f9;
            }
        `;
        document.head.appendChild(style);
    }

    let activeCallback = null;

    // 2. Ensure DOM container elements exist
    function initPopupDOM() {
        injectPopupStyles();
        if (document.getElementById('globalPopupOverlay')) return;

        const container = document.createElement('div');
        container.id = 'globalPopupOverlay';
        container.className = 'popup-overlay';
        container.innerHTML = `
            <div class="popup-card" role="dialog" aria-modal="true">
                <button type="button" class="popup-close-btn" id="globalPopupClose" aria-label="Close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="popup-icon-badge info" id="globalPopupIconBadge">
                    <i class="fa-solid fa-circle-info" id="globalPopupIcon"></i>
                </div>
                <h3 class="popup-title" id="globalPopupTitle">Notification</h3>
                <div class="popup-message" id="globalPopupMessage"></div>
                <div class="popup-action-html hidden" id="globalPopupAction"></div>
                <div class="popup-buttons" id="globalPopupButtons">
                    <button type="button" class="popup-btn popup-btn-primary" id="globalPopupOkBtn">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        const overlay = document.getElementById('globalPopupOverlay');
        const closeBtn = document.getElementById('globalPopupClose');

        closeBtn.addEventListener('click', closePopup);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                closePopup();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closePopup();
            }
        });
    }

    function closePopup() {
        const overlay = document.getElementById('globalPopupOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
        if (typeof activeCallback === 'function') {
            const cb = activeCallback;
            activeCallback = null;
            cb();
        }
    }

    /**
     * Display a modern onscreen popup modal
     * @param {string|object} message - Message text/HTML or options object
     * @param {string} [type='info'] - 'success' | 'error' | 'warning' | 'info' | 'network'
     * @param {string} [title] - Optional modal title
     * @param {string} [actionHtml] - Optional HTML below message
     * @param {function} [callback] - Callback when closed
     */
    function showPopup(message, type = 'info', title = null, actionHtml = null, callback = null) {
        initPopupDOM();

        // Support object argument signature
        if (typeof message === 'object' && message !== null) {
            const opts = message;
            message = opts.message || '';
            type = opts.type || 'info';
            title = opts.title || null;
            actionHtml = opts.actionHtml || null;
            callback = opts.callback || null;
        }

        activeCallback = callback;

        const badge = document.getElementById('globalPopupIconBadge');
        const icon = document.getElementById('globalPopupIcon');
        const titleEl = document.getElementById('globalPopupTitle');
        const messageEl = document.getElementById('globalPopupMessage');
        const actionEl = document.getElementById('globalPopupAction');
        const buttonsContainer = document.getElementById('globalPopupButtons');

        // Restore single OK button layout
        buttonsContainer.innerHTML = `
            <button type="button" class="popup-btn popup-btn-primary" id="globalPopupOkBtn">OK</button>
        `;
        const okBtn = document.getElementById('globalPopupOkBtn');
        okBtn.addEventListener('click', closePopup);

        badge.className = 'popup-icon-badge ' + type;

        let iconClass = 'fa-solid fa-circle-info';
        let defaultTitle = 'Notification';

        if (type === 'success') {
            iconClass = 'fa-solid fa-circle-check';
            defaultTitle = 'Success';
        } else if (type === 'error') {
            iconClass = 'fa-solid fa-circle-xmark';
            defaultTitle = 'Error';
        } else if (type === 'warning') {
            iconClass = 'fa-solid fa-triangle-exclamation';
            defaultTitle = 'Attention';
        } else if (type === 'network') {
            iconClass = 'fa-solid fa-wifi';
            defaultTitle = 'Connection Error';
        }

        icon.className = iconClass;
        titleEl.textContent = title || defaultTitle;
        messageEl.innerHTML = message;

        if (actionHtml) {
            actionEl.innerHTML = actionHtml;
            actionEl.classList.remove('hidden');
        } else {
            actionEl.innerHTML = '';
            actionEl.classList.add('hidden');
        }

        const overlay = document.getElementById('globalPopupOverlay');
        overlay.classList.add('active');

        setTimeout(() => {
            if (okBtn) okBtn.focus();
        }, 50);
    }

    /**
     * Display a modern confirmation popup dialog
     * @param {string} message - Message to confirm
     * @param {string} [title='Are you sure?'] - Confirmation title
     * @param {function} [onConfirm] - Callback if user confirms
     * @param {function} [onCancel] - Callback if user cancels
     * @param {string} [confirmText='Confirm'] - Text for confirm button
     * @param {string} [cancelText='Cancel'] - Text for cancel button
     */
    function showConfirmPopup(message, title = 'Are you sure?', onConfirm = null, onCancel = null, confirmText = 'Confirm', cancelText = 'Cancel') {
        initPopupDOM();

        const badge = document.getElementById('globalPopupIconBadge');
        const icon = document.getElementById('globalPopupIcon');
        const titleEl = document.getElementById('globalPopupTitle');
        const messageEl = document.getElementById('globalPopupMessage');
        const actionEl = document.getElementById('globalPopupAction');
        const buttonsContainer = document.getElementById('globalPopupButtons');

        badge.className = 'popup-icon-badge warning';
        icon.className = 'fa-solid fa-triangle-exclamation';
        titleEl.textContent = title;
        messageEl.innerHTML = message;
        actionEl.innerHTML = '';
        actionEl.classList.add('hidden');

        buttonsContainer.innerHTML = `
            <button type="button" class="popup-btn popup-btn-secondary" id="globalPopupCancelBtn">${cancelText}</button>
            <button type="button" class="popup-btn popup-btn-danger" id="globalPopupConfirmBtn">${confirmText}</button>
        `;

        const overlay = document.getElementById('globalPopupOverlay');
        overlay.classList.add('active');

        const confirmBtn = document.getElementById('globalPopupConfirmBtn');
        const cancelBtn = document.getElementById('globalPopupCancelBtn');

        function cleanup() {
            overlay.classList.remove('active');
        }

        confirmBtn.onclick = () => {
            cleanup();
            if (typeof onConfirm === 'function') onConfirm();
        };

        cancelBtn.onclick = () => {
            cleanup();
            if (typeof onCancel === 'function') onCancel();
        };

        setTimeout(() => {
            if (confirmBtn) confirmBtn.focus();
        }, 50);
    }

    // Expose global functions
    window.showPopup = showPopup;
    window.showConfirmPopup = showConfirmPopup;

    // Override standard browser alert with custom popup
    window.alert = function (msg, title) {
        showPopup(msg, 'info', title || 'Alert');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPopupDOM);
    } else {
        initPopupDOM();
    }
})();
