(function(Scratch) {
  'use strict';

  class PopupExtension {
    getInfo() {
      return {
        id: 'popupExtension',
        name: '弹窗',
        blocks: [
          {
            opcode: 'showPopup',
            blockType: Scratch.BlockType.COMMAND,
            text: '弹窗 内容 [MESSAGE]',
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '你好！'
              }
            }
          }
        ]
      };
    }

    showPopup(args) {
      alert(args.MESSAGE);
    }
  }

  Scratch.extensions.register(new PopupExtension());
})(Scratch);
