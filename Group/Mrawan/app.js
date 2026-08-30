const KEY_PRODUCTS = "grocery_products_v1",
  KEY_SALES = "grocery_sales_v1";
let products = JSON.parse(localStorage.getItem(KEY_PRODUCTS) || "null") || [
  { code: "1001", name: "سكر 1 كجم", price: 35, stock: 20 },
  { code: "1002", name: "أرز 1 كجم", price: 32, stock: 18 },
  { code: "1003", name: "زيت 1 لتر", price: 75, stock: 12 },
  { code: "1004", name: "مكرونة", price: 15, stock: 30 },
  { code: "1005", name: "شاي", price: 45, stock: 10 },
  { code: "1006", name: "مياه", price: 8, stock: 40 },
];
let sales = JSON.parse(localStorage.getItem(KEY_SALES) || "[]"),
  cart = [],
  editCode = null;

const money = (n) => Number(n || 0).toFixed(2) + " ج.م";
function save() {
  localStorage.setItem(KEY_PRODUCTS, JSON.stringify(products));
  localStorage.setItem(KEY_SALES, JSON.stringify(sales));
}
function renderProducts(filter = "") {
  const q = filter.trim().toLowerCase(),
    list = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.includes(q),
    );
  document.getElementById("products_list").innerHTML =
    list
      .map(
        (
          p,
        ) => `<div class="border-4 border-sky-400" onclick="addToCart('${p.code}')">
 <h3>${p.name}</h3><div class="price">${money(p.price)}</div><div class="stock">الكود: ${p.code} — المخزون: ${p.stock}</div></div>`,
      )
      .join("") || "<p>لا توجد منتجات.</p>";
}
function addToCart(code) {
  const p = products.find((x) => x.code === code);
  if (!p || p.stock <= 0) {
    alert("المنتج غير متوفر في المخزون");
    return;
  }
  const row = cart.find((x) => x.code === code);
  if (row) {
    if (row.qty >= p.stock) {
      alert("لا توجد كمية كافية");
      return;
    }
    row.qty++;
  } else cart.push({ code, qty: 1 });
  renderCart();
}
function renderCart() {
  const el = document.getElementById("cart");
  if (!cart.length) {
    el.innerHTML = "<p>الفاتورة فارغة. اضغط على منتج لإضافته.</p>";
  } else
    el.innerHTML = cart
      .map((r, i) => {
        const p = products.find((x) => x.code === r.code);
        return `<div class="cart-row">
 <div><b>${p.name}</b><br><small>${money(p.price)} × ${r.qty}</small></div>
 <input class="qty" type="number" min="1" max="${p.stock}" value="${r.qty}" onchange="changeQty(${i},this.value)">
 <b>${money(p.price * r.qty)}</b><button class="remove" onclick="removeCart(${i})">×</button></div>`;
      })
      .join("");
  const total = cart.reduce(
    (s, r) => s + products.find((p) => p.code === r.code).price * r.qty,
    0,
  );
  document.getElementById("total").textContent = money(total);
  updateChange();
}
function changeQty(i, v) {
  const p = products.find((x) => x.code === cart[i].code);
  let n = Math.max(1, Math.min(Number(v) || 1, p.stock));
  cart[i].qty = n;
  renderCart();
}
function removeCart(i) {
  cart.splice(i, 1);
  renderCart();
}
function updateChange() {
  const total = cart.reduce(
      (s, r) => s + products.find((p) => p.code === r.code).price * r.qty,
      0,
    ),
    paid = Number(document.getElementById("paid").value) || 0;
  document.getElementById("change").textContent = money(
    Math.max(0, paid - total),
  );
}
function renderTable() {
  document.getElementById("productsTable").innerHTML = products
    .map(
      (p) =>
        `<tr><td>${p.code}</td><td>${p.name}</td><td>${money(p.price)}</td><td>${p.stock}</td><td class="actions"><button class="primary small" onclick="editProduct('${p.code}')">تعديل</button><button class="danger small" onclick="deleteProduct('${p.code}')">حذف</button></td></tr>`,
    )
    .join("");
  const low = products.filter((p) => p.stock <= 5);
  document.getElementById("stockAlert").innerHTML = low.length
    ? `<div class="alert">⚠️ منتجات مخزونها قليل: ${low.map((p) => p.name + " (" + p.stock + ")").join("، ")}</div>`
    : "";
  document.getElementById("productCount").textContent = products.length;
}
function openModal(p = null) {
  editCode = p?.code || null;
  document.getElementById("modalTitle").textContent = p
    ? "تعديل منتج"
    : "إضافة منتج";
  document.getElementById("pCode").value = p?.code || "";
  document.getElementById("pName").value = p?.name || "";
  document.getElementById("pPrice").value = p?.price || "";
  document.getElementById("pStock").value = p?.stock ?? "";
  document.getElementById("pCode").disabled = !!p;
  document.getElementById("modal").classList.remove("hidden");
}
function editProduct(code) {
  openModal(products.find((p) => p.code === code));
}
function deleteProduct(code) {
  if (confirm("هل تريد حذف المنتج؟")) {
    products = products.filter((p) => p.code !== code);
    save();
    renderProducts(document.getElementById("search").value);
    renderTable();
  }
}
function saveProduct() {
  const code = document.getElementById("pCode").value.trim(),
    name = document.getElementById("pName").value.trim(),
    price = Number(document.getElementById("pPrice").value),
    stock = Number(document.getElementById("pStock").value);
  if (!code || !name || price < 0 || stock < 0) {
    alert("من فضلك أكمل البيانات بشكل صحيح");
    return;
  }
  if (editCode) {
    const p = products.find((x) => x.code === editCode);
    Object.assign(p, { name, price, stock });
  } else {
    if (products.some((p) => p.code === code)) {
      alert("كود المنتج موجود بالفعل");
      return;
    }
    products.push({ code, name, price, stock });
  }
  save();
  document.getElementById("modal").classList.add("hidden");
  renderProducts();
  renderTable();
}
function todayKey() {
  return new Date().toLocaleDateString("en-CA");
}
function renderReports() {
  const today = todayKey(),
    ts = sales.filter((s) => s.date === today),
    sum = ts.reduce((a, s) => a + s.total, 0);
  document.getElementById("todaySales").textContent = money(sum);
  document.getElementById("todayInvoices").textContent = ts.length;
  document.getElementById("salesTable").innerHTML =
    sales
      .slice(-20)
      .reverse()
      .map(
        (s) =>
          `<tr><td>${s.id}</td><td>${new Date(s.time).toLocaleString("ar-EG")}</td><td>${money(s.total)}</td></tr>`,
      )
      .join("") || "<tr><td colspan='3'>لا توجد فواتير.</td></tr>";
}
function printInvoice(sale) {
  document.getElementById("printArea").innerHTML =
    `<div class="print-invoice"><h2>🛒 بقالة</h2><div>فاتورة رقم: ${sale.id}</div><div>${new Date(sale.time).toLocaleString("ar-EG")}</div><div class="print-line"></div>
 ${sale.items.map((x) => `<div class="print-row"><span>${x.name} × ${x.qty}</span><span>${money(x.price * x.qty)}</span></div>`).join("")}
 <div class="print-line"></div><div class="print-row"><b>الإجمالي</b><b>${money(sale.total)}</b></div><div class="print-row"><span>المدفوع</span><span>${money(sale.paid)}</span></div><div class="print-row"><span>الباقي</span><span>${money(sale.change)}</span></div><p style="text-align:center">شكراً لزيارتكم ❤️</p></div>`;
  setTimeout(() => window.print(), 100);
}
function checkout() {
  if (!cart.length) {
    alert("الفاتورة فارغة");
    return;
  }
  const total = cart.reduce(
      (s, r) => s + products.find((p) => p.code === r.code).price * r.qty,
      0,
    ),
    paid = Number(document.getElementById("paid").value) || 0;
  if (paid < total) {
    alert("المبلغ المدفوع أقل من الإجمالي");
    return;
  }
  const sale = {
    id: "INV-" + Date.now().toString().slice(-6),
    time: new Date().toISOString(),
    date: todayKey(),
    total,
    paid,
    change: paid - total,
    items: cart.map((r) => {
      const p = products.find((x) => x.code === r.code);
      p.stock -= r.qty;
      return { name: p.name, price: p.price, qty: r.qty };
    }),
  };
  sales.push(sale);
  save();
  cart = [];
  document.getElementById("paid").value = 0;
  renderCart();
  renderProducts();
  renderTable();
  renderReports();
  printInvoice(sale);
}
document.querySelectorAll(".nav-btn").forEach(
  (b) =>
    (b.onclick = () => {
      document
        .querySelectorAll(".nav-btn")
        .forEach((x) => x.classList.remove("active"));
      document
        .querySelectorAll(".page")
        .forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      document.getElementById(b.dataset.page).classList.add("active");
      if (b.dataset.page === "reports") renderReports();
    }),
);
if (document.getElementById("search")) {
  document.getElementById("search").oninput = (e) =>
    renderProducts(e.target.value);
  document.getElementById("paid").oninput = updateChange;
  document.getElementById("clearCart").onclick = () => {
    cart = [];
    renderCart();
  };
  document.getElementById("checkout").onclick = checkout;
  document.getElementById("addProductBtn").onclick = () => openModal();
  document.getElementById("cancelModal").onclick = () =>
    document.getElementById("modal").classList.add("hidden");
  document.getElementById("saveProduct").onclick = saveProduct;
}
setInterval(
  () =>
    (document.getElementById("clock").textContent = new Date().toLocaleString(
      "ar-EG",
    )),
  1000,
);
renderProducts();
renderCart();
renderTable();
renderReports();
