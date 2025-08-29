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
              selected: isCellInSelectedWord(row - 1, col - 1)
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
    return row === word.row && col >= word.col && col < word.col + word.length;
  } else if (word.direction === 'down') {
    return col === word.col && row >= word.row && row < word.row + word.length;
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

  // 3. If cell is in selected word, switch direction
  const currentWord = props.crosswordGame.getWord(selectedCell.value.row, selectedCell.value.col, selectedDirection.value);
  if (!currentWord) return;
  if (
    (currentWord.direction === 'across' && row === currentWord.row && col >= currentWord.col && col < currentWord.col + currentWord.length) ||
    (currentWord.direction === 'down' && col === currentWord.col && row >= currentWord.row && row < currentWord.row + currentWord.length)
  ) {
    const newDirection = selectedDirection.value === 'across' ? 'down' : 'across';
    const newWord = props.crosswordGame.getWord(row, col, newDirection);
    if (newWord) {
      selectedCell.value = { row, col };
      selectedDirection.value = newDirection;
    }
  }
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

.crossword-cell.selected {
  background: #fffbe6 !important;
}
</style>
