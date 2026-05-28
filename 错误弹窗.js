(function(Scratch) {
  'use strict';

  class ErrorDialogExtension {
    getInfo() {
      return {
        id: 'errordialog',
        name: '报错弹窗',
        blocks: [
          {
            opcode: 'showError',
            blockType: Scratch.BlockType.COMMAND,
            text: '报错弹窗 内容 [MESSAGE]',
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '发生错误'
              }
            }
          }
        ]
      };
    }

    showError(args) {
      const message = args.MESSAGE;

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      }

      const existingOverlay = document.querySelector('#tw-error-dialog-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }

      const overlay = document.createElement('div');
      overlay.id = 'tw-error-dialog-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      `;

      const dialog = document.createElement('div');
      dialog.style.cssText = `
        background: #fff;
        border-radius: isMobile ? '16px' : '12px';
        padding: isMobile ? '28px 24px 20px 24px' : '24px 32px 20px 32px';
        min-width: isMobile ? '260px' : '280px';
        max-width: isMobile ? '80%' : '400px';
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        text-align: center;
        animation: fadeInScale 0.15s ease-out;
      `;

      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `;
      document.head.appendChild(style);

      const iconContainer = document.createElement('div');
      iconContainer.style.cssText = `
        margin-bottom: 16px;
      `;
      iconContainer.innerHTML = `
        <svg width="isMobile ? 56 : 48" height="isMobile ? 56 : 48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#D32F2F" stroke-width="1.5" fill="white"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="#D32F2F" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="12" cy="16" r="0.8" fill="#D32F2F" stroke="#D32F2F" stroke-width="1.5"/>
        </svg>
      `;

      const text = document.createElement('p');
      text.style.cssText = `
        margin: 0 0 isMobile ? '24px' : '20px' 0;
        font-size: isMobile ? '15px' : '14px';
        color: #333;
        line-height: 1.5;
        word-break: break-word;
      `;
      text.textContent = message;

      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = '确定';
      confirmBtn.style.cssText = `
        background: #D32F2F;
        border: none;
        color: white;
        font-size: isMobile ? '16px' : '14px';
        font-weight: 500;
        padding: isMobile ? '12px 32px' : '8px 28px';
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        width: isMobile ? '100%' : 'auto';
        min-width: isMobile ? '120px' : '100px';
      `;

      confirmBtn.onmouseover = () => {
        if (!isMobile) {
          confirmBtn.style.background = '#B71C1C';
        }
      };
      confirmBtn.onmouseout = () => {
        if (!isMobile) {
          confirmBtn.style.background = '#D32F2F';
        }
      };
      confirmBtn.onmousedown = () => {
        confirmBtn.style.transform = 'scale(0.98)';
      };
      confirmBtn.onmouseup = () => {
        confirmBtn.style.transform = 'scale(1)';
      };
      confirmBtn.onclick = () => {
        overlay.remove();
        style.remove();
      };

      if (isMobile) {
        confirmBtn.style.touchAction = 'manipulation';
        confirmBtn.addEventListener('touchstart', () => {
          confirmBtn.style.background = '#B71C1C';
          confirmBtn.style.transform = 'scale(0.98)';
        });
        confirmBtn.addEventListener('touchend', () => {
          confirmBtn.style.background = '#D32F2F';
          confirmBtn.style.transform = 'scale(1)';
        });
      }

      dialog.appendChild(iconContainer);
      dialog.appendChild(text);
      dialog.appendChild(confirmBtn);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
          overlay.remove();
          style.remove();
          document.removeEventListener('keydown', closeOnEsc);
        }
      };
      document.addEventListener('keydown', closeOnEsc);

      if (isMobile) {
        confirmBtn.focus();
      }
    }
  }

  Scratch.extensions.register(new ErrorDialogExtension());
})(Scratch);
