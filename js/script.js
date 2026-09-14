const money = n => "₹" + n.toLocaleString("en-IN");
const getCart = () => JSON.parse(localStorage.getItem("soleStreetCart") || "[]");
const saveCart = cart => localStorage.setItem("soleStreetCart", JSON.stringify(cart));

function updateCartCount(){
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll("#cartCount").forEach(el=>el.textContent=count);
}

function productCard(p){
  return `<article class="product-card">
    <div class="shoe-image"><span class="tag">${p.tag}</span><span class="shoe">${p.emoji}</span></div>
    <div class="product-info"><small>${p.category}</small><h3>${p.name}</h3><div class="price-row"><strong>${money(p.price)}</strong><button onclick="addToCart(${p.id})">ADD +</button></div></div>
  </article>`;
}

function renderProducts(list=products){
  const grid=document.getElementById("productGrid");
  if(grid) grid.innerHTML=list.length ? list.map(productCard).join("") : "<p>No sneakers found.</p>";
}

function addToCart(id){
  const cart=getCart(), item=cart.find(i=>i.id===id);
  if(item) item.qty++; else cart.push({id,qty:1});
  saveCart(cart); updateCartCount();
  alert("Sneaker added to cart!");
}

function renderFeatured(){
  const el=document.getElementById("featuredProducts");
  if(el) el.innerHTML=products.slice(0,3).map(productCard).join("");
}

function renderCart(){
  const el=document.getElementById("cartContainer"); if(!el) return;
  const cart=getCart();
  if(!cart.length){el.innerHTML=`<div class="empty"><div>🛒</div><h2>Your cart is empty</h2><p>Add some sneakers to get started.</p><a class="btn" href="products.html">SHOP NOW</a></div>`; return;}
  let total=0;
  const rows=cart.map(item=>{
    const p=products.find(x=>x.id===item.id); const sub=p.price*item.qty; total+=sub;
    return `<div class="cart-item"><div class="mini-shoe">👟</div><div class="cart-name"><small>${p.category}</small><h3>${p.name}</h3><strong>${money(p.price)}</strong></div><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><b>${item.qty}</b><button onclick="changeQty(${p.id},1)">+</button></div><strong>${money(sub)}</strong><button class="remove" onclick="removeItem(${p.id})">×</button></div>`;
  }).join("");
  el.innerHTML=`<div class="cart-list">${rows}</div><div class="cart-total"><span>Total</span><strong>${money(total)}</strong><a class="btn" href="payment.html">PROCEED TO PAYMENT →</a></div>`;
}

function changeQty(id,delta){
  let cart=getCart(), item=cart.find(i=>i.id===id);
  if(item){item.qty+=delta;if(item.qty<=0) cart=cart.filter(i=>i.id!==id);}
  saveCart(cart);updateCartCount();renderCart();
}
function removeItem(id){saveCart(getCart().filter(i=>i.id!==id));updateCartCount();renderCart();}

function renderSummary(){
  const el=document.getElementById("orderSummary"); if(!el)return;
  const cart=getCart(); let total=0;
  const items=cart.map(i=>{const p=products.find(x=>x.id===i.id);total+=p.price*i.qty;return `<div><span>${p.name} × ${i.qty}</span><strong>${money(p.price*i.qty)}</strong></div>`}).join("");
  el.innerHTML=`<h2>Order Summary</h2>${items||"<p>Your cart is empty.</p>"}<hr><div class="summary-total"><span>Total</span><strong>${money(total)}</strong></div>`;
}

function setupValidation(){
 const form=document.getElementById("paymentForm"); if(!form)return;
 const card=document.getElementById("card");
 card.addEventListener("input",e=>{let v=e.target.value.replace(/\D/g,"").slice(0,16);e.target.value=v.replace(/(.{4})/g,"$1 ").trim();});
 document.getElementById("expiry").addEventListener("input",e=>{let v=e.target.value.replace(/\D/g,"").slice(0,4);e.target.value=v.length>2?v.slice(0,2)+"/"+v.slice(2):v;});
 form.addEventListener("submit",e=>{
   e.preventDefault(); const err=document.getElementById("formError");
   const name=document.getElementById("name").value.trim(), email=document.getElementById("email").value.trim();
   const phone=document.getElementById("phone").value.trim(), address=document.getElementById("address").value.trim();
   const cardNo=card.value.replace(/\s/g,""), expiry=document.getElementById("expiry").value, cvv=document.getElementById("cvv").value, pin=document.getElementById("pin").value;
   if(!getCart().length){err.textContent="Your cart is empty.";return;}
   if(name.length<3){err.textContent="Please enter your full name.";return;}
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){err.textContent="Please enter a valid email.";return;}
   if(!/^\d{10}$/.test(phone)){err.textContent="Phone number must contain 10 digits.";return;}
   if(address.length<10){err.textContent="Please enter a complete delivery address.";return;}
   if(!/^\d{16}$/.test(cardNo)){err.textContent="Card number must contain 16 digits.";return;}
   if(!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)){err.textContent="Enter expiry in MM/YY format.";return;}
   if(!/^\d{3}$/.test(cvv)){err.textContent="CVV must contain 3 digits.";return;}
   if(!/^\d{6}$/.test(pin)){err.textContent="PIN code must contain 6 digits.";return;}
   err.textContent=""; localStorage.removeItem("soleStreetCart");
   alert("Order placed successfully! Thank you for shopping with SoleStreet.");
   window.location.href="index.html";
 });
}

document.addEventListener("DOMContentLoaded",()=>{
 updateCartCount(); renderFeatured(); renderProducts(); renderCart(); renderSummary(); setupValidation();
 const search=document.getElementById("searchInput"), filter=document.getElementById("categoryFilter");
 function filterProducts(){let q=(search?.value||"").toLowerCase(), c=filter?.value||"all";renderProducts(products.filter(p=>(p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q))&&(c==="all"||p.category===c)));}
 search?.addEventListener("input",filterProducts); filter?.addEventListener("change",filterProducts);
});
