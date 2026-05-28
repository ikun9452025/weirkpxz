(function(Scratch) {
  'use strict';

  class ProjectStatsExtension {
    getInfo() {
      return {
        id: 'projectstats',
        name: '项目统计',
        blocks: [
          {
            opcode: 'getSpriteCount',
            blockType: Scratch.BlockType.REPORTER,
            text: '角色数量',
            disableMonitor: true
          },
          {
            opcode: 'getBlockCount',
            blockType: Scratch.BlockType.REPORTER,
            text: '积木总数',
            disableMonitor: true
          }
        ]
      };
    }

    getSpriteCount() {
      try {
        const vm = Scratch.vm;
        if (!vm || !vm.runtime) {
          return -1;
        }
        const targets = vm.runtime.targets;
        if (!targets) {
          return -1;
        }
        let count = 0;
        for (const target of targets) {
          if (target && !target.isStage) {
            count++;
          }
        }
        return count;
      } catch(e) {
        return -1;
      }
    }

    getBlockCount() {
      try {
        const vm = Scratch.vm;
        if (!vm || !vm.runtime) {
          return -1;
        }
        const targets = vm.runtime.targets;
        if (!targets) {
          return -1;
        }
        let totalBlocks = 0;
        for (const target of targets) {
          if (target && target.blocks) {
            const blocks = target.blocks._blocks;
            if (blocks) {
              for (const id in blocks) {
                if (blocks[id] && blocks[id].opcode) {
                  totalBlocks++;
                }
              }
            }
          }
        }
        return totalBlocks;
      } catch(e) {
        return -1;
      }
    }
  }

  Scratch.extensions.register(new ProjectStatsExtension());
})(Scratch);
