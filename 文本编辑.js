(function(Scratch) {
    'use strict';

    if (!Scratch || !Scratch.extensions) {
        console.error('Scratch 扩展系统不可用');
        return;
    }


    const extension = {
        getInfo: function() {
            return {
                id: 'texttool',
                name: '文本处理',
                color1: '#4CAF50',
                color2: '#388E3C',
                blocks: [
                    {
                        opcode: 'replaceText',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '替换 [TEXT] 的 [OLD] 为 [NEW]',
                        arguments: {
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'hello,world' },
                            OLD: { type: Scratch.ArgumentType.STRING, defaultValue: ',' },
                            NEW: { type: Scratch.ArgumentType.STRING, defaultValue: ' ' }
                        }
                    },
                    {
                        opcode: 'splitText',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '分割 [TEXT] 按 [SEP] 取第 [INDEX] 项',
                        arguments: {
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: '1 2 3' },
                            SEP: { type: Scratch.ArgumentType.STRING, defaultValue: ' ' },
                            INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
                        }
                    },
                    {
                        opcode: 'joinText',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '合并 [LIST] 用 [SEP] 连接',
                        arguments: {
                            LIST: { type: Scratch.ArgumentType.LIST },
                            SEP: { type: Scratch.ArgumentType.STRING, defaultValue: ' ' }
                        }
                    },
                    {
                        opcode: 'trimText',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '去除空格 [TEXT]',
                        arguments: {
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: '  hello  ' }
                        }
                    },
                    {
                        opcode: 'toUpper',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '转大写 [TEXT]',
                        arguments: {
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'hello' }
                        }
                    },
                    {
                        opcode: 'toLower',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '转小写 [TEXT]',
                        arguments: {
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'HELLO' }
                        }
                    },
                    {
                        opcode: 'lengthText',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '长度 [TEXT]',
                        arguments: {
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'hello' }
                        }
                    },
                    {
                        opcode: 'subText',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '截取 [TEXT] 从 [START] 到 [END]',
                        arguments: {
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'hello world' },
                            START: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            END: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 }
                        }
                    }
                ]
            };
        },

        replaceText: function(args) {
            const text = String(args.TEXT);
            const oldStr = String(args.OLD);
            const newStr = String(args.NEW);
            return text.split(oldStr).join(newStr);
        },

        splitText: function(args) {
            const text = String(args.TEXT);
            const sep = String(args.SEP);
            const index = Math.floor(Number(args.INDEX)) - 1;
            const parts = text.split(sep);
            if (index < 0 || index >= parts.length) return '';
            return parts[index];
        },

        joinText: function(args) {
            const list = args.LIST;
            const sep = String(args.SEP);
            const arr = [];
            for (let i = 0; i < list.length; i++) {
                arr.push(String(list[i]));
            }
            return arr.join(sep);
        },

        trimText: function(args) {
            return String(args.TEXT).trim();
        },

        toUpper: function(args) {
            return String(args.TEXT).toUpperCase();
        },

        toLower: function(args) {
            return String(args.TEXT).toLowerCase();
        },

        lengthText: function(args) {
            return String(args.TEXT).length;
        },

        subText: function(args) {
            const text = String(args.TEXT);
            const start = Math.floor(Number(args.START)) - 1;
            const end = Math.floor(Number(args.END));
            if (start < 0) return '';
            if (end > text.length) return text.slice(start);
            return text.slice(start, end);
        }
    };

    Scratch.extensions.register(extension);
})(Scratch);