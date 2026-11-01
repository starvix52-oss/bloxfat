document.addEventListener("DOMContentLoaded", () => {
  const firebaseConfig = {
    apiKey: "AIzaSyCzQN9QcDGw0nYILb578G_LuJtDwZCxo",
    authDomain: "bloxfat-f7e49.firebaseapp.com",
    databaseURL: "https://bloxfat-f7e49-default-rtdb.firebaseio.com",
    projectId: "bloxfat-f7e49",
    storageBucket: "bloxfat-f7e49.firebasestorage.app",
    messagingSenderId: "441781787954",
    appId: "1:441781787954:web:5b0ba1c99770e0894f0b2b",
    measurementId: "G-JDEXN5W0NK"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  // === 1. СИСТЕМА АВТОРИЗАЦИИ ===
  const authModal = document.getElementById('authModal');
  const authUsername = document.getElementById('authUsername');
  const authPassword = document.getElementById('authPassword');
  const authError = document.getElementById('authError');
  const authLoginBtn = document.getElementById('authLoginBtn');
  
  let currentUser = localStorage.getItem('bloxluck_username');

  if (!currentUser) {
    authModal.style.display = 'flex';
  } else {
    authModal.style.display = 'none';
    document.querySelector('.username').innerText = currentUser;
    document.querySelector('.user-profile img').src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser}`;
  }

  authLoginBtn.addEventListener('click', () => {
    const user = authUsername.value.trim();
    const pass = authPassword.value.trim();

    if (user.length < 3) {
      authError.style.display = 'block';
      authError.innerText = 'Ник должен быть от 3 символов!';
      return;
    }
    if (pass.length < 6) {
      authError.style.display = 'block';
      authError.innerText = 'Пароль должен быть от 6 символов!';
      return;
    }

    localStorage.setItem('bloxluck_username', user);
    window.location.reload();
  });

  // === 2. УВЕДОМЛЕНИЯ ОБ ОШИБКАХ ===
  function showError(text) {
    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.innerText = text;
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.classList.add('show'), 10);
    setTimeout(() => {
      alertBox.classList.remove('show');
      setTimeout(() => alertBox.remove(), 300);
    }, 3000);
  }

  // === 3. БАЗА ПРЕДМЕТОВ ===
  const allItems = [
    { name: "Traveler's Gun", rarity: "Godly", price: 5200 },
    { name: "Gingerscope", rarity: "Ancient", price: 14500 },
    { name: "C. Traveler's Gun", rarity: "Chroma", price: 140000 },
    { name: "Zombie Dog", rarity: "Pet", price: 750 }
  ];

  const defaultInventory = [
    { name: "Tides", rarity: "Godly", price: 10 },
    { name: "Frostsaber", rarity: "Godly", price: 10 },
    { name: "Chill", rarity: "Godly", price: 10 },
    { name: "Eggblade", rarity: "Godly", price: 5 },
    { name: "Snowflake", rarity: "Godly", price: 5 },
    { name: "Peppermint", rarity: "Godly", price: 4 },
    { name: "Cookieblade", rarity: "Godly", price: 3 },
    { name: "Seer", rarity: "Godly", price: 3 },
    { name: "Red Seer", rarity: "Godly", price: 3 },
    { name: "Orange Seer", rarity: "Godly", price: 2 },
    { name: "Yellow Seer", rarity: "Godly", price: 2 },
    { name: "Ice Shard", rarity: "Godly", price: 7 }
  ];

  let inventoryItems = JSON.parse(localStorage.getItem('inv_' + currentUser));
  if (!inventoryItems) {
    inventoryItems = [...defaultInventory];
    localStorage.setItem('inv_' + currentUser, JSON.stringify(inventoryItems));
  }

  let totalInventoryValue = inventoryItems.reduce((sum, item) => sum + item.price, 0);
  const balanceDisplay = document.querySelector('.balance-pill');
  balanceDisplay.innerHTML = `<span class="coin-icon">🪙</span> ${totalInventoryValue}`;

  function getItemImage(name, rarity) {
    let cleanName = name.replace(/'/g, "").replace(/ /g, "_").replace(/\./g, "");
    let folder = "mm2godlies";
    if (rarity === "Ancient") folder = "mm2ancients";
    else if (rarity === "Chroma") folder = "mm2chromas";
    else if (rarity === "Pet") folder = "mm2pets";
    else if (rarity === "Unique") folder = "mm2uniques";
    return `https://supremevalues.com/media/${folder}/${cleanName}.webp`;
  }

  const modal = document.getElementById('createModal');
  const openBtn = document.getElementById('openModalBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const inventoryGrid = document.getElementById('inventoryGrid');
  const selectedCountEl = document.getElementById('selectedCount');
  const myMatchesBtn = document.querySelector('.my-matches');
  const matchPanel = document.querySelector('.match-panel');
  
  let selectedItems = [];
  let myChoice = 'T';
  let showAllMatches = false;
  window.targetMatchKey = null; 

  // === 4. ОТРИСОВКА ИНВЕНТАРЯ ===
  function renderInventory() {
    inventoryGrid.innerHTML = '';
    selectedItems = [];
    selectedCountEl.textContent = '0';

    inventoryItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <img src="${getItemImage(item.name, item.rarity)}" class="item-img" alt="${item.name}" onerror="this.src='https://i.postimg.cc/yx5hfgTT/no-Filter-(1).webp'">
        <div class="item-name">${item.name}</div>
        <div class="item-rarity ${item.rarity.toLowerCase()}">${item.rarity}</div>
        <div style="font-size:10px; color:#6b7280; margin-top:2px;">${item.price > 0 ? item.price : 'N/A'}</div>
      `;
      
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
        if (card.classList.contains('selected')) {
          selectedItems.push(item);
        } else {
          selectedItems = selectedItems.filter(i => i.name !== item.name);
        }
        const total = selectedItems.reduce((sum, i) => sum + i.price, 0);
        selectedCountEl.textContent = total;
      });
      inventoryGrid.appendChild(card);
    });
  }

  renderInventory();

  // === 5. АНИМАЦИЯ МОНЕТКИ (ВЫНЕСЕНА НАВЕРХ ДЛЯ ДОСТУПА) ===
  function startCoinFlipAnimation(matchKey, botChoice, myItemsStaked, botItemsStaked) {
    const animOverlay = document.createElement('div');
    animOverlay.className = 'anim-overlay';
    const isWinner = (myChoice === 'T' && Math.random() > 0.5) || (myChoice === 'H' && Math.random() > 0.5);
    const winResult = isWinner ? "You Win!" : "You Lose :(";
    
    animOverlay.innerHTML = `
      <div class="coin-flip-wrapper">
        <div class="coin-anim" id="flipCoin">
          <div class="coin-face coin-heads">H</div>
          <div class="coin-face coin-tails">T</div>
        </div>
        <div class="result-message" id="resultMessage"></div>
      </div>
    `;
    document.body.appendChild(animOverlay);

    const coin = document.getElementById('flipCoin');
    let flipCount = 0;
    const flipInterval = setInterval(() => {
      coin.style.transform = 'scaleX(0)';
      setTimeout(() => {
        const currentSide = flipCount % 2 === 0 ? 'T' : 'H';
        coin.innerHTML = `<div class="coin-face coin-${currentSide === 'T' ? 'tails' : 'heads'}">${currentSide}</div>`;
        coin.style.transform = 'scaleX(1)';
        flipCount++;
      }, 100);
    }, 200);

    setTimeout(() => {
      clearInterval(flipInterval);
      db.ref('matches/' + matchKey).remove();

      if (isWinner) {
        if (botItemsStaked && botItemsStaked.length > 0) {
          botItemsStaked.forEach(itemName => {
            const foundItem = allItems.find(i => i.name === itemName);
            if (foundItem) inventoryItems.push(foundItem);
          });
        }
      } else {
        if (myItemsStaked && myItemsStaked.length > 0) {
          inventoryItems = inventoryItems.filter(invItem => 
            !myItemsStaked.some(staked => staked.name === invItem.name)
          );
        }
      }

      localStorage.setItem('inv_' + currentUser, JSON.stringify(inventoryItems));
      renderInventory();
      
      totalInventoryValue = inventoryItems.reduce((sum, item) => sum + item.price, 0);
      balanceDisplay.innerHTML = `<span class="coin-icon">🪙</span> ${totalInventoryValue}`;

      const resultDiv = document.getElementById('resultMessage');
      resultDiv.innerHTML = `<span style="font-size: 48px; color: ${isWinner ? '#4ade80' : '#ef4444'}; margin-bottom: 20px; display: block;">${isWinner ? '✓' : '✗'}</span> ${winResult}`;
      resultDiv.style.opacity = '1';
      resultDiv.style.transform = 'translateY(0)';

      setTimeout(() => {
        animOverlay.classList.add('fade-out');
        setTimeout(() => animOverlay.remove(), 500);
      }, 3000);
    }, 2000);
  }

  // === 6. КНОПКИ ===
  openBtn.addEventListener('click', () => {
    window.targetMatchKey = null;
    document.querySelector('.modal-header h2').innerText = "Select Items";
    modal.classList.add('active');
  });

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

  myMatchesBtn.addEventListener('click', () => {
    showAllMatches = !showAllMatches;
    if (showAllMatches) {
      myMatchesBtn.style.color = '#6b7280';
      myMatchesBtn.innerHTML = '⚔️ ALL MATCHES';
    } else {
      myMatchesBtn.style.color = '#4ade80';
      myMatchesBtn.innerHTML = '⚔️ MY MATCHES';
    }
    updateMatchesDisplay();
  });

  document.getElementById('btnSelectT').addEventListener('click', () => {
    myChoice = 'T';
    document.getElementById('btnSelectT').style.outline = '3px solid #4ade80';
    document.getElementById('btnSelectH').style.outline = 'none';
  });
  document.getElementById('btnSelectH').addEventListener('click', () => {
    myChoice = 'H';
    document.getElementById('btnSelectH').style.outline = '3px solid #4ade80';
    document.getElementById('btnSelectT').style.outline = 'none';
  });

  // === 7. СОЗДАНИЕ МАТЧА И JOIN ===
  document.getElementById('confirmCreateBtn').addEventListener('click', () => {
    if (selectedItems.length === 0) return showError('Выберите хотя бы один предмет!');
    const myTotalPrice = selectedItems.reduce((sum, i) => sum + i.price, 0);
    
    if (myTotalPrice < 10) return showError('Минимальная ставка — 10 валют!');

    modal.classList.remove('active');

    // Если это JOIN
    if (window.targetMatchKey) {
      const matchRef = db.ref('matches/' + window.targetMatchKey);
      matchRef.once('value').then((snapshot) => {
        const match = snapshot.val();
        if (!match) return showError('Этот матч уже удален!');

        const diff = Math.abs(match.totalPrice - myTotalPrice);
        if (diff > 10) return showError(`Разница должна быть не больше 10! (Ваша: ${myTotalPrice}, Его: ${match.totalPrice})`);

        matchRef.update({
          status: "matched",
          opponent: currentUser,
          opponentChoice: myChoice,
          opponentItems: selectedItems.map(i => i.name),
          opponentRarity: selectedItems.map(i => i.rarity),
          opponentPrice: myTotalPrice
        }).then(() => {
          startCoinFlipAnimation(window.targetMatchKey, match.choice, selectedItems, match.items);
          selectedItems = [];
          selectedCountEl.textContent = '0';
          document.querySelectorAll('.item-card').forEach(c => c.classList.remove('selected'));
          window.targetMatchKey = null;
        });
      });
      return;
    }

    // Если это CREATE
    const newMatchRef = db.ref('matches').push();
    newMatchRef.set({
      creator: currentUser,
      choice: myChoice,
      items: selectedItems.map(i => i.name),
      itemsRarity: selectedItems.map(i => i.rarity), 
      totalPrice: myTotalPrice,
      status: "waiting",
      timestamp: Date.now()
    }).then(() => {
      selectedItems = [];
      selectedCountEl.textContent = '0';
      document.querySelectorAll('.item-card').forEach(c => c.classList.remove('selected'));
    });
  });

  // === 8. ОТОБРАЖЕНИЕ МАТЧЕЙ ===
  function updateMatchesDisplay() {
    matchPanel.innerHTML = '';
    db.ref('matches').on('value', (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        matchPanel.innerHTML = `<div style="color: #4b5563; text-align: center; width: 100%; font-weight: 600; padding: 20px;">No matches yet</div>`;
        return;
      }

      let hasMatches = false;
      matchPanel.innerHTML = '';

      Object.keys(data).forEach(key => {
        const match = data[key];
        if (!showAllMatches && match.creator !== currentUser) return;
        hasMatches = true;

        const itemRarity = (match.itemsRarity && match.itemsRarity[0]) ? match.itemsRarity[0] : "Godly";
        
        const matchHTML = `
          <div class="match-row">
            <div class="match-left">
              <div class="match-coins">
                <div class="coin-3d coin-${match.choice === 'T' ? 'blue' : 'red'} small"><span>${match.choice}</span></div>
                <span class="match-vs">VS</span>
                <div class="coin-3d coin-${match.opponentChoice === 'T' ? 'blue' : 'red'} small"><span>${match.opponentChoice || '?'}</span></div>
              </div>
              <div class="match-creator">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: #333; margin-right: 8px; display: inline-block;"></div>
                <span>${match.creator}</span>
              </div>
            </div>

            <div class="match-center">
              <div class="match-skin-box">
                <img src="${getItemImage(match.items[0], itemRarity)}" onerror="this.src='https://i.postimg.cc/yx5hfgTT/no-Filter-(1).webp'" alt="skin">
              </div>
            </div>

            <div class="match-right">
              <div class="match-price">
                <span style="color: #4ade80; font-size: 20px; font-weight: 800;">${match.totalPrice} 🪙</span>
                <span style="color: #6b7280; font-size: 12px;">15 - 20</span>
              </div>
              
              ${match.creator !== currentUser 
                ? `<button class="btn-join" onclick="openJoinModal('${key}')">JOIN</button>` 
                : `<button class="btn-cancel" onclick="cancelMatch('${key}')">CANCEL</button>`
              }
            </div>
          </div>
        `;
        matchPanel.insertAdjacentHTML('beforeend', matchHTML);
      });

      if (!hasMatches) {
        matchPanel.innerHTML = `<div style="color: #4b5563; text-align: center; width: 100%; font-weight: 600; padding: 20px;">No matches yet</div>`;
      }
    });
  }

  updateMatchesDisplay();

  window.openJoinModal = (matchKey) => {
    window.targetMatchKey = matchKey;
    selectedItems = [];
    selectedCountEl.textContent = '0';
    document.querySelectorAll('.item-card').forEach(c => c.classList.remove('selected'));

    document.querySelector('.modal-header h2').innerText = "Select Items to JOIN";
    modal.classList.add('active');
  };

  window.cancelMatch = (key) => {
    db.ref('matches/' + key).remove();
  };

  // === 9. ЧАТ ===
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const chatBody = document.getElementById('chatBody');

  chatSendBtn.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (text === '') return;
    db.ref('chat').push({ user: currentUser, text: text, timestamp: Date.now() });
    chatInput.value = '';
  });
  chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') chatSendBtn.click(); });

  db.ref('chat').limitToLast(50).on('child_added', (snapshot) => {
    const data = snapshot.val();
    const date = new Date(data.timestamp);
    const timeStr = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
    const html = `
      <div class="chat-message">
        <img src="https://i.postimg.cc/yx5hfgTT/no-Filter-(1).webp" class="msg-avatar">
        <div class="msg-content">
          <div class="msg-header">
            <span class="msg-user">${data.user}</span>
            <span class="msg-time">${timeStr}</span>
          </div>
          <div class="msg-text">${data.text}</div>
        </div>
      </div>
    `;
    chatBody.insertAdjacentHTML('beforeend', html);
    chatBody.scrollTop = chatBody.scrollHeight;
  });
});