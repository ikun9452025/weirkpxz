(function(Scratch) {
    'use strict';

    if (!Scratch || !Scratch.extensions) {
        console.error('Scratch 扩展系统不可用');
        return;
    }

    console.log('决策器扩展加载中...');

    function decideAction(state, rolePos) {
        const g1 = state[0] || 0;
        const g2 = state[1] || 0;
        const g3 = state[2] || 0;
        const t1 = state[3] || 0;
        const t2 = state[4] || 0;
        const t3 = state[5] || 0;
        const z1 = state[6] || 0;
        const z2 = state[7] || 0;
        const z3 = state[8] || 0;
        const d1 = state[9] || 0;
        const d2 = state[10] || 0;
        const d3 = state[11] || 0;
        
        let dangerCol = 0;
        if (z1 > 0) dangerCol = 1;
        else if (z2 > 0) dangerCol = 2;
        else if (z3 > 0) dangerCol = 3;
        
        let itemCol = 0;
        if (d1 > 0) itemCol = 1;
        else if (d2 > 0) itemCol = 2;
        else if (d3 > 0) itemCol = 3;
        
        let coinCol = 0;
        if (g1 > 0) coinCol = 1;
        else if (g2 > 0) coinCol = 2;
        else if (g3 > 0) coinCol = 3;
        
        let taoCol = 0;
        if (t1 > 0) taoCol = 1;
        else if (t2 > 0) taoCol = 2;
        else if (t3 > 0) taoCol = 3;
        
        if (dangerCol > 0) {
            if (dangerCol === 1 && rolePos === 1) return 3;
            if (dangerCol === 2 && rolePos === 2) return Math.random() < 0.5 ? 1 : 3;
            if (dangerCol === 3 && rolePos === 3) return 1;
            return 2;
        }
        
        if (itemCol > 0) {
            if (rolePos < itemCol) return 3;
            if (rolePos > itemCol) return 1;
            return 2;
        }
        
        if (coinCol > 0) {
            if (rolePos < coinCol) return 3;
            if (rolePos > coinCol) return 1;
            return 2;
        }
        
        if (taoCol > 0) {
            if (rolePos === taoCol) {
                if (taoCol === 1) return 3;
                if (taoCol === 2) return Math.random() < 0.5 ? 1 : 3;
                if (taoCol === 3) return 1;
            }
            return 2;
        }
        
        return 2;
    }

    const extension = {
        getInfo: function() {
            return {
                id: 'decision',
                name: '决策器',
                color1: '#FF6B35',
                color2: '#E55A2B',
                blocks: [
                    {
                        opcode: 'decide',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '决策 状态 [STATE] 位置 [POS]',
                        arguments: {
                            STATE: { type: Scratch.ArgumentType.STRING, defaultValue: '0 0 0 0 0 0 0 0 0 0 0 0' },
                            POS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 }
                        }
                    }
                ]
            };
        },

        decide: function(args) {
            const stateStr = String(args.STATE);
            const stateArray = stateStr.split(/\s+/).map(Number).filter(n => !isNaN(n));
            while (stateArray.length < 12) stateArray.push(0);
            const rolePos = Math.floor(Number(args.POS));
            return decideAction(stateArray, rolePos);
        }
    };

    Scratch.extensions.register(extension);
    console.log('决策器扩展加载成功!');
})(Scratch);