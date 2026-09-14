(function(Scratch) {
  'use strict';

  class TerminalExtension {
    constructor(runtime) {
      this.runtime = runtime;
      this.maxLogs = 100;
      this.isFullscreen = false;
      this.isMinimized = false;
      this.terminalElement = null;
      this.logContainer = null;
      this.threadContainer = null;
      this.titleBar = null;
      this.offsetX = 0;
      this.offsetY = 0;
      this.isDragging = false;
      
      this.restoreLeft = '20px';
      this.restoreTop = '20px';
      this.restoreWidth = '350px';
      this.restoreHeight = '250px';

      setTimeout(() => this.initUI(), 100);
    }

    initUI() {
      if (document.getElementById('tw-custom-terminal')) return;

      this.terminalElement = document.createElement('div');
      this.terminalElement.id = 'tw-custom-terminal';
      this.terminalElement.style.cssText = `
        position: absolute; top: 20px; left: 20px; width: 350px; height: 250px;
        background: rgba(30, 30, 30, 0.95); color: #fff; border: 2px solid #555;
        border-radius: 8px; font-family: 'Consolas', 'Courier New', monospace;
        font-size: 12px; display: flex; flex-direction: column; z-index: 9999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5); resize: both; overflow: hidden;
        transition: all 0.3s ease;
      `;

      this.titleBar = document.createElement('div');
      this.titleBar.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 5px 10px; background: #333; border-bottom: 1px solid #555; cursor: move; user-select: none;`;
      
      const titleText = document.createElement('span');
      titleText.innerText = '终端 (Terminal)';
      titleText.className = 'terminal-title-text';
      this.titleBar.appendChild(titleText);

      const btnContainer = document.createElement('div');
      btnContainer.className = 'terminal-buttons';
      
      const fullscreenBtn = document.createElement('button');
      fullscreenBtn.innerText = '⛶';
      fullscreenBtn.style.cssText = `background: none; border: none; color: #fff; cursor: pointer; font-size: 14px; margin-right: 5px;`;
      fullscreenBtn.title = "全屏铺满舞台";
      fullscreenBtn.onclick = (e) => { e.stopPropagation(); this.setFullscreen(); };

      const minimizeBtn = document.createElement('button');
      minimizeBtn.innerText = '🗕';
      minimizeBtn.style.cssText = `background: none; border: none; color: #ffcc00; cursor: pointer; font-size: 14px; margin-right: 5px;`;
      minimizeBtn.title = "最小化到右下角";
      minimizeBtn.onclick = (e) => { e.stopPropagation(); this.toggleMinimize(); };

      const closeBtn = document.createElement('button');
      closeBtn.innerText = '✖';
      closeBtn.style.cssText = `background: none; border: none; color: #ff5555; cursor: pointer; font-size: 14px;`;
      closeBtn.onclick = (e) => { e.stopPropagation(); this.hideTerminal(); };

      btnContainer.appendChild(fullscreenBtn);
      btnContainer.appendChild(minimizeBtn);
      btnContainer.appendChild(closeBtn);
      this.titleBar.appendChild(btnContainer);

      this.logContainer = document.createElement('div');
      this.logContainer.className = 'terminal-content';
      this.logContainer.style.cssText = `flex: 1; overflow-y: auto; padding: 5px 10px; line-height: 1.4; word-wrap: break-word;`;

      const threadHeader = document.createElement('div');
      threadHeader.className = 'terminal-content';
      threadHeader.innerText = '当前运行线程:';
      threadHeader.style.cssText = `padding: 5px 10px; background: #2a2a2a; font-weight: bold; border-top: 1px solid #555;`;
      
      this.threadContainer = document.createElement('div');
      this.threadContainer.className = 'terminal-content';
      this.threadContainer.style.cssText = `height: 60px; overflow-y: auto; padding: 5px 10px; background: #222; display: flex; flex-wrap: wrap; gap: 5px; align-items: flex-start;`;

      this.terminalElement.appendChild(this.titleBar);
      this.terminalElement.appendChild(this.logContainer);
      this.terminalElement.appendChild(threadHeader);
      this.terminalElement.appendChild(this.threadContainer);

      document.body.appendChild(this.terminalElement);

      this.terminalElement.addEventListener('click', () => {
        if (this.isMinimized) this.toggleMinimize();
      });

      this.titleBar.addEventListener('mousedown', (e) => {
        if (this.isFullscreen || this.isMinimized) return;
        this.isDragging = true;
        this.offsetX = e.clientX - this.terminalElement.offsetLeft;
        this.offsetY = e.clientY - this.terminalElement.offsetTop;
      });

      document.addEventListener('mousemove', (e) => {
        if (this.isDragging && !this.isFullscreen && !this.isMinimized) {
          this.terminalElement.style.left = (e.clientX - this.offsetX) + 'px';
          this.terminalElement.style.top = (e.clientY - this.offsetY) + 'px';
        }
      });

      document.addEventListener('mouseup', () => { this.isDragging = false; });
      
      this.startThreadMonitor();
    }

    setFullscreen() {
      if (this.isMinimized) this.toggleMinimize();
      this.isFullscreen = true;
      const stage = document.querySelector('[class*="stage_stage_"]') || document.body;
      const rect = stage.getBoundingClientRect();
      
      this.terminalElement.style.top = rect.top + 'px';
      this.terminalElement.style.left = rect.left + 'px';
      this.terminalElement.style.width = rect.width + 'px';
      this.terminalElement.style.height = rect.height + 'px';
      this.terminalElement.style.borderRadius = '0';
      this.terminalElement.style.border = 'none';
      this.terminalElement.style.zIndex = '10000';
    }

    toggleMinimize() {
      if (this.isFullscreen) this.isFullscreen = false;
      this.isMinimized = !this.isMinimized;

      if (this.isMinimized) {
        this.restoreLeft = this.terminalElement.style.left;
        this.restoreTop = this.terminalElement.style.top;
        this.restoreWidth = this.terminalElement.style.width;
        this.restoreHeight = this.terminalElement.style.height;

        document.querySelectorAll('.terminal-content').forEach(el => el.style.display = 'none');
        document.querySelector('.terminal-title-text').style.display = 'none';
        document.querySelector('.terminal-buttons').style.display = 'none';

        const stage = document.querySelector('[class*="stage_stage_"]') || document.body;
        const rect = stage.getBoundingClientRect();
        const size = 25;

        this.terminalElement.style.width = size + 'px';
        this.terminalElement.style.height = size + 'px';
        this.terminalElement.style.left = (rect.right - size - 10) + 'px';
        this.terminalElement.style.top = (rect.bottom - size - 10) + 'px';
        this.terminalElement.style.borderRadius = '5px';
        this.terminalElement.style.border = '2px solid #ffcc00';
        this.terminalElement.style.backgroundColor = '#333';
        this.terminalElement.style.resize = 'none';
        
        this.titleBar.style.height = '100%';
        this.titleBar.style.width = '100%';
        this.titleBar.style.borderRadius = '3px';
        this.titleBar.style.justifyContent = 'center';
        this.titleBar.style.padding = '0';
        this.titleBar.style.cursor = 'pointer';
      } else {
        document.querySelectorAll('.terminal-content').forEach(el => el.style.display = 'block');
        document.querySelector('.terminal-title-text').style.display = 'inline';
        document.querySelector('.terminal-buttons').style.display = 'flex';

        this.terminalElement.style.width = this.restoreWidth || '350px';
        this.terminalElement.style.height = this.restoreHeight || '250px';
        this.terminalElement.style.left = this.restoreLeft || '20px';
        this.terminalElement.style.top = this.restoreTop || '20px';
        this.terminalElement.style.borderRadius = '8px';
        this.terminalElement.style.border = '2px solid #555';
        this.terminalElement.style.backgroundColor = 'rgba(30, 30, 30, 0.95)';
        this.terminalElement.style.resize = 'both';
        
        this.titleBar.style.height = 'auto';
        this.titleBar.style.width = 'auto';
        this.titleBar.style.borderRadius = '0';
        this.titleBar.style.justifyContent = 'space-between';
        this.titleBar.style.padding = '5px 10px';
        this.titleBar.style.cursor = 'move';
      }
    }

    hideTerminal() { this.terminalElement.style.display = 'none'; }
    showTerminal() { this.terminalElement.style.display = 'flex'; }

    addLog(type, message) {
      if (!this.logContainer) return;
      const colors = { 'log': '#cccccc', 'warn': '#ffcc00', 'error': '#ff9999', 'fatal': '#ff0000' };
      const color = colors[type] || '#cccccc';
      const logEntry = document.createElement('div');
      logEntry.style.color = color;
      let prefix = type === 'warn' ? '⚠ ' : (type === 'error' ? '❌ ' : (type === 'fatal' ? '☹︎ ' : ''));
      logEntry.innerText = `${prefix}${message}`;
      this.logContainer.appendChild(logEntry);
      if (this.logContainer.children.length > this.maxLogs) this.logContainer.removeChild(this.logContainer.firstChild);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    startThreadMonitor() {
      setInterval(() => {
        if (!this.threadContainer || !this.runtime || !this.runtime.threads) return;
        if (this.isMinimized) return;

        this.threadContainer.innerHTML = '';
        let activeCount = 0;
        
        this.runtime.threads.forEach((thread, index) => {
          if (!thread.stack || thread.stack.length === 0) return;
          activeCount++;
          const threadId = thread.id || `T-${index}`;
          
          const tag = document.createElement('div');
          tag.style.cssText = `background: #444; padding: 2px 8px; border-radius: 4px; display: flex; align-items: center; gap: 5px; font-size: 11px; cursor: default;`;
          
          const nameSpan = document.createElement('span');
          nameSpan.innerText = threadId;
          
          const killBtn = document.createElement('span');
          killBtn.innerText = '✖';
          killBtn.style.cssText = `color: #ff5555; cursor: pointer; font-weight: bold;`;
          killBtn.onclick = (e) => {
            e.stopPropagation();
            if (thread && this.runtime) {
              this.runtime.threads.splice(this.runtime.threads.indexOf(thread), 1);
              this.addLog('warn', `已强制结束线程: ${threadId}`);
            }
          };

          tag.appendChild(nameSpan);
          tag.appendChild(killBtn);
          this.threadContainer.appendChild(tag);
        });

        if (activeCount === 0) {
          const emptyMsg = document.createElement('span');
          emptyMsg.style.color = '#666';
          emptyMsg.innerText = '无运行中的线程';
          this.threadContainer.appendChild(emptyMsg);
        }
      }, 500);
    }

    getInfo() {
      return {
        id: 'terminalplus',
        name: '终端',
        color1: '#0FBD8C',
        blocks: [
          { opcode: 'log', blockType: Scratch.BlockType.COMMAND, text: '日志 [TEXT]', arguments: { TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Hello' } } },
          { opcode: 'warn', blockType: Scratch.BlockType.COMMAND, text: '警告 [TEXT]', arguments: { TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Warning' } } },
          { opcode: 'error', blockType: Scratch.BlockType.COMMAND, text: '错误 [TEXT]', arguments: { TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Error' } } },
          { opcode: 'fatal', blockType: Scratch.BlockType.COMMAND, text: '致命错误 [TEXT]', arguments: { TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Fatal' } } },
          { opcode: 'clear', blockType: Scratch.BlockType.COMMAND, text: '清空' },
          { opcode: 'show', blockType: Scratch.BlockType.COMMAND, text: '显示终端' },
          { opcode: 'getThreadCount', blockType: Scratch.BlockType.REPORTER, text: '当前线程数' }
        ]
      };
    }

    log(args) { this.addLog('log', args.TEXT); }
    warn(args) { this.addLog('warn', args.TEXT); }
    error(args) { this.addLog('error', args.TEXT); }
    fatal(args) { this.addLog('fatal', args.TEXT); }
    clear() { if (this.logContainer) this.logContainer.innerHTML = ''; }
    show() { this.showTerminal(); }
    getThreadCount() { return this.runtime.threads.filter(t => t.stack && t.stack.length > 0).length; }
  }

  Scratch.extensions.register(new TerminalExtension(Scratch.vm.runtime));
})(Scratch);