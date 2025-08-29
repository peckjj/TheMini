<template>
  <div class="crossword-region">
    <div
      class="crossword-grid"
      :key="renderKey"
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
          >
            <span class="cell-text">
              {{ crosswordGame.getCharAt(row - 1, col - 1)?.replace(BLANK_CHAR, '') || '' }}
            </span>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
import { ref, defineEmits } from 'vue';
import type { ICrosswordGame } from '../../../Crossword/src/Interfaces/ICrosswordGame';
import type { TDirection } from '../../../Crossword/src/Types/TDirection';
import { BLANK_CHAR } from '../../../Crossword/src/Interfaces/IWord';

const props = defineProps<{ crosswordGame: ICrosswordGame }>();
const emit = defineEmits<{ (e: 'selectionChange', cell: { row: number, col: number }, direction: TDirection): void }>();

const selectedCell = ref<{ row: number, col: number } | null>(null);
const selectedDirection = ref<TDirection | null>(null);
const renderKey = ref(0);

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

  emit('selectionChange', { row: selectedCell.value.row, col: selectedCell.value.col }, selectedDirection.value);
}

function flipDirection(direction: TDirection): TDirection {
  return direction === 'across' ? 'down' : 'across';
}

function handleKeydown(e: KeyboardEvent) {
  if (!selectedCell.value) return;
  const key = e.key;
  if (/^[a-zA-Z]$/.test(key)) {
    props.crosswordGame.setCharAt(selectedCell.value.row, selectedCell.value.col, key);
    renderKey.value++
    const newRow = selectedDirection.value == 'across' ? selectedCell.value.row : selectedCell.value.row + 1;
    const newCol = selectedDirection.value == 'across' ? selectedCell.value.col + 1 : selectedCell.value.col;
    if (selectedDirection.value && props.crosswordGame.getWord(newRow, newCol, selectedDirection.value)) {
      selectedCell.value = { row: newRow, col: newCol };
      emit('selectionChange', { row: newRow, col: newCol }, selectedDirection.value);
    }

    e.preventDefault();
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
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.crossword-cell.current {
  box-shadow: 0 0 0 3px #ffd700 inset;
  z-index: 1;
}

.crossword-cell.selected {
  background: #fffbe6 !important;
}

.cell-text {
  font-size: 6cqw;
  font-weight: 600;
  color: #222;
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  user-select: none;
  pointer-events: none;
}
</style>
