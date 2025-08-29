<template>
  <div class="crossword-region">
    <div
      class="crossword-grid"
      :style="{
        gridTemplateRows: `repeat(${crosswordGame.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${crosswordGame.cols}, 1fr)`
      }"
    >
      <template v-for="row in crosswordGame.rows">
        <template v-for="col in crosswordGame.cols" :key="`${row}-${col}`">
          <div
            class="crossword-cell"
            :class="{
              selected: isCellInSelectedWord(row - 1, col - 1),
              current: selectedCell?.row === row - 1 && selectedCell?.col === col - 1
            }"
            :style="{ background: crosswordGame.intersectsWord(row - 1, col - 1) ? '#fff' : '#000' }"
            @click="handleCellClick(row - 1, col - 1)"
          ></div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ICrosswordGame } from '../../../Crossword/src/Interfaces/ICrosswordGame';
import type { TDirection } from '../../../Crossword/src/Types/TDirection';

const props = defineProps<{ crosswordGame: ICrosswordGame }>();

const selectedCell = ref<{ row: number, col: number } | null>(null);
const selectedDirection = ref<TDirection | null>(null);

function isCellInSelectedWord(row: number, col: number): boolean {
  if (!selectedCell.value || !selectedDirection.value) return false;
  const word = props.crosswordGame.getWord(selectedCell.value.row, selectedCell.value.col, selectedDirection.value);
  if (!word) return false;
  if (word.direction === 'across') {
    return row === word.row && col >= word.col && col < word.col + word.text.length;
  } else if (word.direction === 'down') {
    return col === word.col && row >= word.row && row < word.row + word.text.length;
  }
  return false;
}

function handleCellClick(row: number, col: number) {
  if (!props.crosswordGame.intersectsWord(row, col)) return; // 1. Ignore empty cell

  // 2. No selection yet
  if (!selectedCell.value || !selectedDirection.value) {
    // Try across first
    let word = props.crosswordGame.getWord(row, col, 'across');
    if (word) {
      selectedCell.value = { row, col };
      selectedDirection.value = 'across';
      return;
    }
    // Try down
    word = props.crosswordGame.getWord(row, col, 'down');
    if (word) {
      selectedCell.value = { row, col };
      selectedDirection.value = 'down';
      return;
    }
    return;
  }

  let targetDirection = isCellInSelectedWord(row, col) ? flipDirection(selectedDirection.value) : selectedDirection.value;

  // 3. If cell is in selected word, switch direction
  if (props.crosswordGame.getWord(row, col, targetDirection)) {
    selectedDirection.value = targetDirection;
    selectedCell.value = { row, col };
  } else if (props.crosswordGame.getWord(row, col, flipDirection(targetDirection))) {
    selectedDirection.value = flipDirection(targetDirection);
    selectedCell.value = { row, col };
  }
}

function flipDirection(direction: TDirection): TDirection {
  return direction === 'across' ? 'down' : 'across';
}
</script>

<style scoped>
.crossword-region {
  height: 100%;
  width: 100%;
  border: 2px solid #444;
  border-radius: 12px;
  background: rgba(40, 40, 50, 0.7);
  box-sizing: border-box;
}

.crossword-grid {
  display: grid;
  height: 100%;
  width: 100%;
  gap: 2px;
}

.crossword-cell {
  border: 1px solid #555;
  border-radius: 4px;
  width: 100%;
  height: 100%;
  transition: background 0.2s;
}

.crossword-cell.current {
  box-shadow: 0 0 0 3px #ffd700 inset;
  z-index: 1;
}

.crossword-cell.selected {
  background: #fffbe6 !important;
}
</style>
