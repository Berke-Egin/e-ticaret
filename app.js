'use strict';

const products = [
  { id: 1, name: 'Terra Seramik Vazo', category: 'Dekorasyon', price: 649, color: 'Kum beji', art: 'vase', tone: 'sand', badge: 'Çok sevilen' },
  { id: 2, name: 'Luna Masa Lambası', category: 'Aydınlatma', price: 1290, color: 'Adaçayı yeşili', art: 'lamp', tone: 'sage', badge: 'Yeni' },
  { id: 3, name: 'Soft Keten Kırlent', category: 'Tekstil', price: 425, color: 'Kiremit', art: 'pillow', tone: 'rose' },
  { id: 4, name: 'Mori Seramik Kupa', category: 'Mutfak', price: 289, color: 'Krem', art: 'mug', tone: 'cream', badge: 'Çok sevilen' },
  { id: 5, name: 'Olive Dekoratif Kase', category: 'Dekorasyon', price: 479, color: 'Zeytin yeşili', art: 'bowl', tone: 'sage' },
  { id: 6, name: 'Aura Abajur', category: 'Aydınlatma', price: 1590, color: 'Doğal keten', art: 'lamp', tone: 'sand' },
  { id: 7, name: 'Cozy Dokuma Kırlent', category: 'Tekstil', price: 545, color: 'Doğal beyaz', art: 'pillow', tone: 'cream', badge: 'Yeni' },
  { id: 8, name: 'Dune Kahve Kupası', category: 'Mutfak', price: 329, color: 'Toprak', art: 'mug', tone: 'rose' },
];
const storageKey = 'yuva-cart-v1';
const money = value => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);
let cart = readCart();
let category = 'Tümü';
let toastTimer;

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
    return Object.fromEntries(products.filter(p => Number.isInteger(saved[p.id]) && saved[p.id] > 0 && saved[p.id] <= 20).map(p => [p.id, saved[p.id]]));
  } catch { return {}; }
}
function saveCart() {
  try { localStorage.setItem(storageKey, JSON.stringify(cart)); }
  catch { showToast('Tarayıcı depolaması kullanılamıyor. Sepetin sayfalar arasında saklanamayabilir.'); }
}
function selectedProducts() { return products.filter(p => cart[p.id]); }
function totals() {
  const subtotal = selectedProducts().reduce((sum, p) => sum + p.price * cart[p.id], 0);
  const shipping = subtotal > 0 && subtotal < 1500 ? 79 : 0;
  return { subtotal, shipping, total: subtotal + shipping };
}
function art(p) { return `<div class="product-art ${p.tone}" aria-hidden="true"><div class="object ${p.art}"></div></div>`; }
function renderProducts() {
  const query = document.querySelector('#search').value.trim().toLocaleLowerCase('tr-TR');
  const sort = document.querySelector('#sort').value;
  const filtered = products.filter(p => (category === 'Tümü' || category === p.category) && `${p.name} ${p.color} ${p.category}`.toLocaleLowerCase('tr-TR').includes(query));
  if (sort !== 'featured') filtered.sort((a, b) => sort === 'price-asc' ? a.price - b.price : b.price - a.price);
  document.querySelector('#products').innerHTML = filtered.map(p => `<article class="product-card"><div class="product-image">${art(p)}${p.badge ? `<span class="badge">${p.badge}</span>` : ''}<button class="add-button" data-add="${p.id}" aria-label="${p.name} sepete ekle">+</button></div><div class="product-info"><div><h3>${p.name}</h3><p>${p.color}</p></div><strong>${money(p.price)}</strong></div></article>`).join('');
  document.querySelector('#product-count').textContent = `${filtered.length} ürün`;
  document.querySelector('#no-results').classList.toggle('hidden', filtered.length > 0);
}
function summaryMarkup() {
  const { subtotal, shipping, total } = totals();
  return `<div class="totals"><p><span>Ara toplam</span><span>${money(subtotal)}</span></p><p><span>Kargo</span><span>${shipping ? money(shipping) : 'Ücretsiz'}</span></p><p class="total"><strong>Toplam</strong><strong>${money(total)}</strong></p></div>`;
}
function renderCart() {
  const count = document.querySelector('#cart-count');
  if (!count) return;
  count.textContent = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const selected = selectedProducts();
  document.querySelector('#cart-items').innerHTML = selected.length ? selected.map(p => `<article class="cart-item">${art(p)}<div class="cart-item-info"><h3>${p.name}</h3><p>${money(p.price)}</p><div class="quantity"><button data-change="${p.id}" data-delta="-1" aria-label="${p.name} adedini azalt">−</button><span>${cart[p.id]}</span><button data-change="${p.id}" data-delta="1" aria-label="${p.name} adedini artır" ${cart[p.id] >= 20 ? 'disabled' : ''}>+</button></div></div><button class="remove-button" data-remove="${p.id}" aria-label="${p.name} sepetten çıkar">Kaldır</button></article>`).join('') : '<div class="empty"><h3>Güzel şeylere yer var.</h3><p>Sepetin henüz boş. Koleksiyonu keşfetmeye başla.</p></div>';
  document.querySelector('#cart-summary').innerHTML = selected.length ? `${summaryMarkup()}<p class="small muted">1.500 TL ve üzeri siparişlerde kargo ücretsiz.</p><a class="button dark full-button" href="checkout.html">Ödemeye geç ↗</a><p class="small muted">Yalnızca deneme amaçlıdır.</p>` : '';
}
function renderCheckout() {
  if (!document.querySelector('#checkout-layout')) return;
  const selected = selectedProducts();
  document.querySelector('#checkout-layout').classList.toggle('hidden', !selected.length);
  document.querySelector('#checkout-empty').classList.toggle('hidden', !!selected.length);
  document.querySelector('#checkout-items').innerHTML = selected.map(p => `<div class="order-item">${art(p)}<div><h3>${p.name}</h3><p>${cart[p.id]} adet · ${p.color}</p></div><strong>${money(p.price * cart[p.id])}</strong></div>`).join('');
  document.querySelector('#checkout-summary').innerHTML = summaryMarkup();
}
function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
}
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.category) {
    category = button.dataset.category;
    document.querySelectorAll('[data-category]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    renderProducts();
  }
  if (button.dataset.add) {
    const id = button.dataset.add;
    if ((cart[id] || 0) >= 20) return showToast('Bir üründen en fazla 20 adet ekleyebilirsin.');
    cart[id] = (cart[id] || 0) + 1;
    showToast(`${products.find(p => p.id === Number(id)).name} sepete eklendi.`);
    saveCart(); renderCart();
  }
  if (button.dataset.change) {
    const id = button.dataset.change;
    cart[id] = Math.min(20, (cart[id] || 0) + Number(button.dataset.delta));
    if (cart[id] <= 0) delete cart[id];
    saveCart(); renderCart();
  }
  if (button.dataset.remove) { delete cart[button.dataset.remove]; saveCart(); renderCart(); }
  if (button.dataset.close) document.getElementById(button.dataset.close).close();
});
document.querySelector('#open-cart')?.addEventListener('click', () => document.querySelector('#cart-dialog').showModal());
document.querySelector('#search')?.addEventListener('input', renderProducts);
document.querySelector('#sort')?.addEventListener('change', renderProducts);
document.querySelector('#checkout-form')?.addEventListener('submit', event => {
  event.preventDefault();
  cart = readCart();
  if (!selectedProducts().length) return renderCheckout();
  cart = {}; saveCart();
  event.target.reset();
  document.querySelector('#checkout-layout').classList.add('hidden');
  const success = document.querySelector('#order-success');
  success.classList.remove('hidden');
  success.setAttribute('tabindex', '-1'); success.focus();
});
window.addEventListener('storage', event => {
  if (event.key === storageKey || event.key === null) { cart = readCart(); renderCart(); if (document.querySelector('#order-success')?.classList.contains('hidden')) renderCheckout(); }
});
if (document.querySelector('#products')) renderProducts();
renderCart(); renderCheckout();
