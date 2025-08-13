
import React, { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Search, Filter, MapPin, Mail, Phone, Upload, X, Plus } from 'lucide-react'

const CATEGORIES = [
  'إلكترونيك','موبيليا','أدوات الدار','دراري و بيبي','لباس و الموضة','رياضة و ترفيه','طوموبيل/موتور/بيّيسات','كتوب و ميديا','حوايج خرين',
] as const

const CONDITIONS = ['كيف الجديدة','مزيان بزاف','مزيان','مقبول'] as const

const SORTS = [
  { key:'newest', label:'جداد اللّولين' },
  { key:'priceAsc', label:'الثمن من الصغير للكبير' },
  { key:'priceDesc', label:'الثمن من الكبير للصغير' },
] as const

type Category = typeof CATEGORIES[number]
type Condition = typeof CONDITIONS[number]

function formatPriceMAD(v:number){ return new Intl.NumberFormat('ar-MA',{style:'currency',currency:'MAD'}).format(v) }

function placeholderSVG(title: string){
  const esc = encodeURIComponent
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#eef2ff'/><stop offset='100%' stop-color='#e0f2fe'/>
    </linearGradient></defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <g font-family='Inter,Segoe UI,Roboto,Arial' fill='#0f172a'>
      <text x='50%' y='50%' font-size='44' text-anchor='middle' dominant-baseline='middle' opacity='0.9'>${title}</text>
    </g>
  </svg>`
  return `data:image/svg+xml;utf8,${esc(svg)}`
}

interface Seller { name: string; email?: string; phone?: string }
interface Listing {
  id: string; title: string; description: string; price: number; category: Category; condition: Condition; location: string; images: string[]; createdAt: number; seller: Seller; fav?: boolean
}

const seed: Listing[] = [
  { id: crypto.randomUUID(), title:'iPhone 12 128GB', description:'حالة مزيانة، خدشة خفيفة فلكادر. الشارجور كاين.', price:3200, category:'إلكترونيك', condition:'مزيان', location:'باد رايخنهال', images:[placeholderSVG('iPhone 12 128GB')], createdAt:Date.now()-1000*60*60*26, seller:{name:'حمزة', email:'hamza@example.com', phone:'+49 1523 7740577'} },
  { id: crypto.randomUUID(), title:'طيبلة خدمة 120×60', description:'لون فاتح، مستعملة شوية برّك. التسليم فزالسبورغ.', price:600, category:'موبيليا', condition:'مزيان بزاف', location:'زالسبورغ', images:[placeholderSVG('طيبلة خدمة 120×60')], createdAt:Date.now()-1000*60*60*8, seller:{name:'سارة', email:'sara@example.com'} },
  { id: crypto.randomUUID(), title:'بيكالة دراري 20"', description:'ألمنيوم خفيف، لا كتصلح ل 6–8 سنين.', price:850, category:'رياضة و ترفيه', condition:'مزيان', location:'لينتس', images:[placeholderSVG('بيكالة 20"')], createdAt:Date.now()-1000*60*60*80, seller:{name:'يونس'} },
]

export default function App(){
  const [items, setItems] = useState<Listing[]>(seed)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('الكل')
  const [sort, setSort] = useState<string>('newest')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(()=>{
    let list = [...items]
    if(q.trim()){
      const s = q.toLowerCase()
      list = list.filter(it => it.title.toLowerCase().includes(s) || it.description.toLowerCase().includes(s))
    }
    if(cat !== 'الكل') list = list.filter(it => it.category === cat)
    const minN = min ? Number(min) : undefined
    const maxN = max ? Number(max) : undefined
    if(minN !== undefined) list = list.filter(it => it.price >= minN)
    if(maxN !== undefined) list = list.filter(it => it.price <= maxN)
    if(sort === 'priceAsc') list.sort((a,b)=>a.price-b.price)
    else if(sort === 'priceDesc') list.sort((a,b)=>b.price-a.price)
    else list.sort((a,b)=>b.createdAt-a.createdAt)
    return list
  }, [items,q,cat,sort,min,max])

  function toggleFav(id:string){ setItems(prev => prev.map(x => x.id===id ? { ...x, fav: !x.fav } : x)) }

  return (
    <div>
      <div className="container">
        <header>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div className="logo">س</div>
            <div>
              <h1>Sou9 Lmokawen</h1>
              <div className="muted">سوق السلع المستعملة – بالدارجة</div>
            </div>
          </div>
          <button className="btn" onClick={()=>setOpen(true)}><Plus size={18} style={{marginInlineEnd:6}}/> زيد إعلان</button>
        </header>

        <div className="row">
          <div style={{display:'flex',gap:8}}>
            <input className="input" placeholder="قلب على سلعة..." value={q} onChange={e=>setQ(e.target.value)}/>
            <button className="btn secondary"><Search size={18} style={{marginInlineEnd:6}}/> قلب</button>
          </div>
          <select className="select" value={cat} onChange={e=>setCat(e.target.value)}>
            <option value="الكل">الكل</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="select" value={sort} onChange={e=>setSort(e.target.value)}>
            {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>

        <div className="controls">
          <input className="input" placeholder="أدنى ثمن (MAD)" value={min} onChange={e=>setMin(e.target.value)} />
          <input className="input" placeholder="أقصى ثمن (MAD)" value={max} onChange={e=>setMax(e.target.value)} />
          <button className="btn secondary" onClick={()=>{setMin('');setMax('')}}><Filter size={16} style={{marginInlineEnd:6}}/> مسح الثمن</button>
          <button className="btn ghost" onClick={()=>{setQ('');setCat('الكل');setSort('newest')}}>تفريغ الكل</button>
        </div>

        <main className="grid" style={{marginTop:12}}>
          <AnimatePresence>
            {filtered.map(it => (
              <motion.div key={it.id} layout initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                <article className="card">
                  <div style={{position:'relative'}}>
                    <img src={it.images[0]} alt={it.title} />
                    <button className="fav" onClick={()=>toggleFav(it.id)} aria-label="تفضيل" style={{color: it.fav ? '#e11d48' : '#0f172a'}}>
                      <Heart size={18}/>
                    </button>
                    <div className="badge" style={{position:'absolute', bottom:10, left:10}}>{it.category}</div>
                  </div>
                  <div className="card-body">
                    <h3 className="title">{it.title}</h3>
                    <p className="muted" style={{margin:'6px 0 10px'}}>{it.description}</p>
                    <div className="between">
                      <div className="price">{formatPriceMAD(it.price)}</div>
                      <div className="stack muted"><MapPin size={16}/>{it.location}</div>
                    </div>
                    <div className="muted" style={{marginTop:6,fontSize:12}}>الحالة: {it.condition}</div>
                    <div className="between" style={{marginTop:10}}>
                      <div className="stack muted" style={{fontSize:13}}>
                        {it.seller.email && <span className="stack"><Mail size={16}/>{it.seller.email}</span>}
                        {it.seller.phone && <span className="stack"><Phone size={16}/>{it.seller.phone}</span>}
                      </div>
                      <button className="btn secondary">تواصل</button>
                    </div>
                  </div>
                </article>
              </motion.div>
            ))}
          </AnimatePresence>
        </main>

        <footer>© {new Date().getFullYear()} Sou9 Lmokawen — موقع للبيع والشراء بالدارجة.</footer>
      </div>

      {open && <NewItemModal onClose={()=>setOpen(false)} onAdd={(l)=>{ setItems([l, ...items]); setOpen(false) }} />}
    </div>
  )
}

function NewItemModal({ onClose, onAdd }:{ onClose:()=>void; onAdd:(l:any)=>void }){
  const [title,setTitle]=useState('')
  const [price,setPrice]=useState('')
  const [category,setCategory]=useState<Category | ''>('')
  const [condition,setCondition]=useState<Condition | ''>('')
  const [description,setDescription]=useState('')
  const [location,setLocation]=useState('')
  const [image,setImage]=useState<string | null>(null)
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [phone,setPhone]=useState('')
  const fileRef = useRef<HTMLInputElement|null>(null)

  function onFile(e:React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if(!f) return
    const reader = new FileReader(); reader.onload = () => setImage(String(reader.result)); reader.readAsDataURL(f)
  }

  function submit(){
    if(!title || !price || !category || !condition){ alert('عافاك كمّل المعلومات الأساسية'); return }
    const l = {
      id: crypto.randomUUID(),
      title, description,
      price: Number(price),
      category: category as Category,
      condition: condition as Condition,
      location,
      images:[ image || placeholderSVG(title) ],
      createdAt: Date.now(),
      seller:{ name, email: email || undefined, phone: phone || undefined }
    }
    onAdd(l)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true">
        <div className="between" style={{marginBottom:8}}>
          <h2 style={{margin:0}}>إضافة إعلان جديد</h2>
          <button className="btn secondary" onClick={onClose}><X size={16} style={{marginInlineEnd:6}}/> إغلاق</button>
        </div>
        <div style={{display:'grid',gap:10, gridTemplateColumns:'1fr 1fr'}}>
          <div><label>العنوان</label><input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="مثال: تلفاز سامسونغ 43"/></div>
          <div><label>الثمن (MAD)</label><input className="input" type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="مثال: 1500"/></div>
          <div><label>الصنف</label><select className="select" value={category} onChange={e=>setCategory(e.target.value as any)}><option value="">اختار</option>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div><label>الحالة</label><select className="select" value={condition} onChange={e=>setCondition(e.target.value as any)}><option value="">اختار</option>{CONDITIONS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div style={{gridColumn:'1 / -1'}}><label>الوصف</label><textarea className="textarea" value={description} onChange={e=>setDescription(e.target.value)} placeholder="تفاصيل على السلعة"/></div>
          <div><label>المدينة/المكان</label><input className="input" value={location} onChange={e=>setLocation(e.target.value)} placeholder="مثال: كازا، الرباط..."/></div>
          <div><label>الصورة</label><div className="stack"><input ref={fileRef} type="file" accept="image/*" onChange={onFile} /><span className="muted" style={{fontSize:12}}>{image ? 'تمّ اختيار صورة' : 'اختياري'}</span></div></div>
        </div>
        <div style={{display:'grid', gap:10, gridTemplateColumns:'1fr 1fr 1fr', marginTop:10}}>
          <div><label>الإسم</label><input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="إسم البائع"/></div>
          <div><label>الإيميل</label><input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@mail.com"/></div>
          <div><label>التّلفون</label><input className="input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="06xxxxxxxx"/></div>
        </div>
        <div className="between" style={{marginTop:14}}>
          <div></div>
          <button className="btn" onClick={submit}>نشر الإعلان</button>
        </div>
      </div>
    </div>
  )
}
