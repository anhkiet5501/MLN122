const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walk(dirPath, callback);
    } else if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
      callback(dirPath);
    }
  });
}

const replacements = [
  // from src/core/data
  { filePattern: /src[\\\/]core[\\\/]data[\\\/]/, old: /from '\.\.\/types\/game\.types'/g, new: "from '../domain/types'" },
  
  // from src/core/engines
  { filePattern: /src[\\\/]core[\\\/]engines[\\\/]/, old: /from '\.\.\/types\/game\.types'/g, new: "from '../domain/types'" },
  
  // from src/presentation/store
  { filePattern: /src[\\\/]presentation[\\\/]store[\\\/]/, old: /from '\.\.\/types\/game\.types'/g, new: "from '../../core/domain/types'" },
  { filePattern: /src[\\\/]presentation[\\\/]store[\\\/]/, old: /from '\.\.\/data\//g, new: "from '../../core/data/" },
  { filePattern: /src[\\\/]presentation[\\\/]store[\\\/]/, old: /from '\.\.\/engine\//g, new: "from '../../core/engines/" },
  { filePattern: /src[\\\/]presentation[\\\/]store[\\\/]/, old: /from '\.\.\/utils\//g, new: "from '../../core/utils/" },

  // from src/presentation/components/*
  { filePattern: /src[\\\/]presentation[\\\/]components[\\\/]/, old: /from '\.\.\/\.\.\/types\/game\.types'/g, new: "from '../../../core/domain/types'" },
  { filePattern: /src[\\\/]presentation[\\\/]components[\\\/]/, old: /from '\.\.\/\.\.\/data\//g, new: "from '../../../core/data/" },
  { filePattern: /src[\\\/]presentation[\\\/]components[\\\/]/, old: /from '\.\.\/\.\.\/engine\/scoreCalculator'/g, new: "from '../../../core/engines/ScoringEngine'" },
  { filePattern: /src[\\\/]presentation[\\\/]components[\\\/]/, old: /from '\.\.\/\.\.\/engine\/monopolyChecker'/g, new: "from '../../../core/engines/MonopolyEngine'" },
  { filePattern: /src[\\\/]presentation[\\\/]components[\\\/]/, old: /from '\.\.\/\.\.\/store\/gameStore'/g, new: "from '../../store/gameStore'" },
  
  // from src/presentation/pages/*
  { filePattern: /src[\\\/]presentation[\\\/]pages[\\\/]/, old: /from '\.\.\/types\/game\.types'/g, new: "from '../../core/domain/types'" },
  { filePattern: /src[\\\/]presentation[\\\/]pages[\\\/]/, old: /from '\.\.\/data\//g, new: "from '../../core/data/" },
  { filePattern: /src[\\\/]presentation[\\\/]pages[\\\/]/, old: /from '\.\.\/engine\/scoreCalculator'/g, new: "from '../../core/engines/ScoringEngine'" },
  { filePattern: /src[\\\/]presentation[\\\/]pages[\\\/]/, old: /from '\.\.\/utils\/localStorage'/g, new: "from '../../infrastructure/persistence/LocalStorageRepository'" },
  { filePattern: /src[\\\/]presentation[\\\/]pages[\\\/]/, old: /from '\.\.\/utils\/uuid'/g, new: "from '../../core/utils/uuid'" },
  { filePattern: /src[\\\/]presentation[\\\/]pages[\\\/]/, old: /from '\.\.\/store\/gameStore'/g, new: "from '../store/gameStore'" },
  { filePattern: /src[\\\/]presentation[\\\/]pages[\\\/]/, old: /from '\.\.\/components\//g, new: "from '../components/" },
];

walk(srcDir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(rep => {
    if (rep.filePattern.test(filePath)) {
      content = content.replace(rep.old, rep.new);
    }
  });

  // Global replacements for specific exports that changed from function to class static methods
  // e.g. calculateFinalScore -> ScoringEngine.calculateFinalScore
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
