document.addEventListener("DOMContentLoaded", () => {
    // 1. Бургер-меню
    const burger = document.querySelector('.burger');
    const navMenu = document.querySelector('nav ul');
    if (burger) {
        burger.addEventListener('click', () => navMenu.classList.toggle('active'));
    }

    const form = document.getElementById('feedbackForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); 
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            const consent = document.getElementById('consent').checked;

            if (name === '' || email === '' || message === '') {
                alert('Пожалуйста, заполните все поля формы!');
                return;
            }
            if (!email.includes('@')) {
                alert('Пожалуйста, введите корректный Email (с символом @).');
                return;
            }
            if (!consent) {
                alert('Необходимо согласие на обработку персональных данных!');
                return;
            }

            const newRequest = {
                id: Date.now(), name: name, email: email, message: message,
                date: new Date().toLocaleDateString('ru-RU'), status: 'Новая'
            };

            let requests = JSON.parse(localStorage.getItem('requests')) || [];
            requests.push(newRequest); 
            localStorage.setItem('requests', JSON.stringify(requests)); 

            alert('Спасибо, ' + name + '! Ваша заявка отправлена.');
            form.reset(); 
        });
    }

    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        if (sessionStorage.getItem('isAdminLogged') === 'true') {
            showAdminPanel();
        }

        const searchInput = document.getElementById('searchInput');
        const filterSelect = document.getElementById('statusFilter');
        
        if(searchInput) searchInput.addEventListener('input', () => renderAdminTable(searchInput.value.toLowerCase(), filterSelect.value));
        if(filterSelect) filterSelect.addEventListener('change', () => renderAdminTable(searchInput.value.toLowerCase(), filterSelect.value));
    }
});


function checkAdminLogin() {
    const login = document.getElementById('adminLogin').value;
    const pass = document.getElementById('adminPass').value;

    if (login === 'admin' && pass === '1234') {
        sessionStorage.setItem('isAdminLogged', 'true');
        showAdminPanel();
    } else {
        alert('Неверный логин или пароль!');
    }
}

function showAdminPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    renderAdminTable();
}

function logoutAdmin() {
    sessionStorage.removeItem('isAdminLogged');
    location.reload();
}

function renderAdminTable(search = '', filterStatus = 'Все') {
    const tableBody = document.getElementById('adminTableBody');
    if (!tableBody) return;

    const requests = JSON.parse(localStorage.getItem('requests')) || [];
    tableBody.innerHTML = ''; 

    let filteredRequests = requests.filter(req => {
        const matchesSearch = req.name.toLowerCase().includes(search) || req.email.toLowerCase().includes(search);
        const matchesStatus = filterStatus === 'Все' || req.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (filteredRequests.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Заявок не найдено</td></tr>';
        return;
    }

    filteredRequests.forEach(req => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.id}</td>
            <td>${req.date}</td>
            <td>${req.name}</td>
            <td>${req.email}</td>
            <td>${req.message}</td>
            <td><span class="status-badge ${req.status === 'Новая' ? 'status-new' : 'status-done'}">${req.status}</span></td>
            <td><button class="btn-small" onclick="changeStatus(${req.id})">Сменить статус</button></td>
        `;
        tableBody.appendChild(tr);
    });
}

function changeStatus(id) {
    let requests = JSON.parse(localStorage.getItem('requests')) || [];
    requests = requests.map(req => {
        if (req.id === id) {
            req.status = req.status === 'Новая' ? 'В обработке' : 'Новая';
        }
        return req;
    });
    localStorage.setItem('requests', JSON.stringify(requests));
    renderAdminTable(document.getElementById('searchInput')?.value || '', document.getElementById('statusFilter')?.value || 'Все');
}