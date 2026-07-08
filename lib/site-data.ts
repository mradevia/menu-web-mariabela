// ============================================================================
//  DATOS DEL SITIO — Maria Bela
//  Este archivo contiene TODOS los datos por defecto del menú y del negocio.
//  El panel de administración (/admin) puede editar estos datos y los guarda
//  en el navegador (localStorage). Si no hay nada guardado, se usan estos.
// ============================================================================

export interface Dish {
  id: number
  name: string
  price: number
  ingredients: string
  tags?: string[]
  image?: string
}

export interface Category {
  title: string
  subtitle: string
  icon: string // nombre del icono (ver lib/icons.tsx)
  items: Dish[]
}

export type MenuData = Record<string, Category>

export interface SiteSettings {
  // Contacto
  whatsapp: string // solo números, formato internacional. Ej: 5215512345678
  phoneDisplay: string // como se muestra. Ej: "55 1234 5678"
  instagramUrl: string
  instagramHandle: string
  facebookUrl: string
  // Ubicación
  addressLine1: string
  addressLine2: string
  mapsUrl: string
  // Horario
  scheduleDays: string // Ej: "Lunes a Sábado"
  scheduleHours: string // Ej: "9:00 AM — 4:00 PM"
  scheduleShort: string // Ej: "LUN-SÁB 9:00 — 16:00" (usado en el header)
  // Código QR del menú
  menuUrl: string // URL a la que apunta el QR. Vacío = usa la URL actual del sitio.
  // Recomendación del Chef / Platillo del día
  featuredDishIds: number[] // ids de platillos elegidos a mano, en el orden que se muestran. Vacío = automático.
}

// ---------------------------------------------------------------------------
//  Configuración del negocio por defecto
// ---------------------------------------------------------------------------
export const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp: "5215512345678",
  phoneDisplay: "55 1234 5678",
  instagramUrl: "https://www.instagram.com/mariabelacoacalco",
  instagramHandle: "@mariabelacoacalco",
  facebookUrl: "https://www.facebook.com/mariabelacoacalco",
  addressLine1: "Eje 8, Villa de las Flores",
  addressLine2: "Coacalco de Berriozábal, EdoMéx.",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Maria+Bela+Coacalco",
  scheduleDays: "Lunes a Sábado",
  scheduleHours: "9:00 AM — 4:00 PM",
  scheduleShort: "LUN-SÁB 9:00 — 16:00",
  menuUrl: "",
  featuredDishIds: [],
}

// ---------------------------------------------------------------------------
//  Menú por defecto
// ---------------------------------------------------------------------------
export const DEFAULT_MENU: MenuData = {
  desayunos: {
    title: "Desayunos",
    subtitle: "Incluyen Jugo o Fruta, Café o Té",
    icon: "Coffee",
    items: [
      { id: 1, name: "Volcán de Chilaquil", price: 109, ingredients: "Sourdough con chilaquiles, pollo, crema y queso gratinado.", tags: ["Estrella"], image: "https://images.unsplash.com/photo-1600335895229-6e75511892c8?q=80&w=600" },
      { id: 2, name: "Huevos al Gusto", price: 80, ingredients: "Salchicha, jamón, estrellados, rancheros, divorciados, a la mexicana, tocino o a la albañil.", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600" },
      { id: 3, name: "Omelette al Gusto", price: 95, ingredients: "Champiñón, jamón, espinaca, tocino, flor de calabaza y elote, quesos o chorizo.", image: "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?q=80&w=600" },
      { id: 4, name: "Omelette Gourmet", price: 99, ingredients: "Espinaca y queso de cabra. Un inicio elegante.", tags: ["Gourmet"], image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?q=80&w=600" },
      { id: 5, name: "Molletes Tradicionales", price: 70, ingredients: "Frijol refrito, jamón, queso gratinado y pico de gallo (orden de 2).", image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600" },
      { id: 6, name: "Molletes con Chorizo o Champiñón", price: 95, ingredients: "Molletes especiales con chorizo o champiñones.", image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=600" },
      { id: 7, name: "Croissant de Jamón", price: 89, ingredients: "Jamón, queso panela y manchego, lechuga y jitomate.", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600" },
      { id: 8, name: "Bagel de Jamón", price: 89, ingredients: "Bagel, huevo, jamón, queso manchego, queso panela, lechuga y jitomate.", image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=600" },
      { id: 9, name: "Chilaquiles", price: 70, ingredients: "Verdes, rojos o divorciados.", image: "https://images.unsplash.com/photo-1600335895229-6e75511892c8?q=80&w=600" },
      { id: 10, name: "Enfrijoladas", price: 97, ingredients: "Enfrijoladas con crema, queso y aguacate (orden de 3).", image: "https://images.unsplash.com/photo-1628191139360-408a40f8ee96?q=80&w=600" },
      { id: 11, name: "Enchiladas", price: 97, ingredients: "Verdes, rojas o divorciadas, rellenas de pollo (orden de 3).", image: "https://images.unsplash.com/photo-1534352591122-7d12cd504b1a?q=80&w=600" },
      { id: 12, name: "Enchiladas Suizas", price: 120, ingredients: "Con ajonjolí y queso gratinado (orden de 3).", tags: ["Premium"], image: "https://images.unsplash.com/photo-1534352591122-7d12cd504b1a?q=80&w=600" },
      { id: 13, name: "Wafles Dulces", price: 85, ingredients: "Mix de berries, chocolate y crema dulce.", image: "https://images.unsplash.com/photo-1562376502-6f7694998877?q=80&w=600" },
      { id: 14, name: "Desayuno Mariabela", price: 95, ingredients: "Orden de wafles con huevo estrellado o al gusto.", tags: ["De la Casa"], image: "https://images.unsplash.com/photo-1562376502-6f7694998877?q=80&w=600" },
      { id: 15, name: "Huevos Mariabela", price: 80, ingredients: "Huevo revuelto en una salsa de guajillo.", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600" },
      { id: 16, name: "Sope Light", price: 80, ingredients: "Nopal con pollo deshebrado bañado en salsa verde, lechuga y queso.", tags: ["Light"], image: "https://images.unsplash.com/photo-1628191139360-408a40f8ee96?q=80&w=600" },
      { id: 17, name: "Sandwich Gratinado", price: 97, ingredients: "Pan de caja, jamón, lechuga, jitomate, queso gratinado y huevo estrellado.", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600" },
      { id: 18, name: "Sincronizadas", price: 69, ingredients: "2 tortillas de harina con jamón, queso manchego, queso Oaxaca y salsa mexicana.", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=600" },
      { id: 19, name: "Tacos Campestres", price: 80, ingredients: "3 tacos de hoja de lechuga con champiñones, elote, jitomate y pollo.", tags: ["Light"], image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=600" },
      { id: 20, name: "Wraps", price: 80, ingredients: "Tortilla de harina u hoja de lechuga rellena de jitomate, cebolla, elote, champiñón, atún o pollo.", image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?q=80&w=600" },
      { id: 21, name: "Árabe Mariabela", price: 89, ingredients: "Jamón de pavo, queso panela, manzana, lechuga y pepino.", image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?q=80&w=600" },
      { id: 22, name: "Pechuga Napolitana", price: 140, ingredients: "Jamón, queso gratinado, salsa de jitomate con guarnición del día.", tags: ["Premium"], image: "https://images.unsplash.com/photo-1632778149975-420e0e75ee6d?q=80&w=600" },
      { id: 23, name: "Sopesitos Sencillos", price: 70, ingredients: "Tres sopesitos, frijol refrito, crema, queso y lechuga.", image: "https://images.unsplash.com/photo-1628191139360-408a40f8ee96?q=80&w=600" },
      { id: 24, name: "Sopesitos Pollo o Carne Asada", price: 97, ingredients: "Tres sopesitos, frijol refrito, lechuga, crema y queso.", image: "https://images.unsplash.com/photo-1628191139360-408a40f8ee96?q=80&w=600" },
      { id: 25, name: "Hotcakes", price: 75, ingredients: "Orden de 3 hotcakes esponjosos.", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=600" },
    ],
  },
  entradas: {
    title: "Entradas",
    subtitle: "Para compartir al estilo de la casa",
    icon: "Utensils",
    items: [
      { id: 30, name: "Espinacas Mariabela", price: 90, ingredients: "Espinacas gratinadas en queso mozzarella y crema.", tags: ["Clásico"] },
      { id: 31, name: "Plato de Carnes Frías", price: 105, ingredients: "Jamón, salchicha, salami, melón, jamón serrano, fresa y pera.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600" },
      { id: 32, name: "Papas al Ajo con Arrachera", price: 115, ingredients: "250g de papas sazonadas con ajo, chile de árbol, aceite de oliva y cajun, acompañadas de 120g de arrachera.", tags: ["Favorito"], image: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?q=80&w=600" },
      { id: 33, name: "Guacamole", price: 80, ingredients: "Aguacate fresco preparado al momento." },
      { id: 34, name: "Guacamole con Arrachera", price: 135, ingredients: "Aguacate fresco con 120g de arrachera premium a la parrilla.", tags: ["Premium"] },
      { id: 35, name: "Gambery y Calamary", price: 145, ingredients: "Camarones y calamares fritos con un toque de limón.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600" },
      { id: 36, name: "Aros de Cebolla", price: 99, ingredients: "Crujientes aros de cebolla empanizados." },
      { id: 37, name: "Alitas Fritas", price: 155, ingredients: "Alitas tradicionales fritas.", tags: ["Hot"] },
      { id: 38, name: "Tiras de Pollo", price: 145, ingredients: "Tiras de pollo empanizadas y crujientes." },
      { id: 39, name: "Papas a la Francesa", price: 99, ingredients: "Papas doradas y crujientes." },
      { id: 40, name: "Boneles", price: 140, ingredients: "Papas a la francesa, boneles y tiras de pollo." },
      { id: 41, name: "Tabla Familiar Alitas", price: 147, ingredients: "Alitas de especialidad para compartir.", tags: ["Para Compartir"] },
    ],
  },
  ensaladas: {
    title: "Ensaladas",
    subtitle: "Frescura y sabor en cada bocado",
    icon: "Salad",
    items: [
      { id: 50, name: "Ensalada César", price: 105, ingredients: "Lechuga, queso parmesano, crotones, pechuga de pollo asada y aderezo césar.", image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=600" },
      { id: 51, name: "Ensalada Caprese", price: 110, ingredients: "Queso mozzarella, rebanadas de jitomate, hojas de albahaca y aceite de olivo.", tags: ["Italia"] },
      { id: 52, name: "Ensalada Frutal", price: 130, ingredients: "Lechuga, arándanos, ajonjolí caramelizado, semilla de girasol, betabel, manzana, pera, fresa, mango, germen y jitomate cherry.", tags: ["Fresh"], image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600" },
      { id: 53, name: "Ensalada Mariabela", price: 130, ingredients: "Lechuga, arándanos, fresa, queso de cabra, ajonjolí caramelizado y pechuga de pollo asada.", tags: ["De la Casa"] },
      { id: 54, name: "Ensalada Mediterránea", price: 135, ingredients: "Calabaza asada, berenjena asada, jitomate asado, lechuga y vinagreta." },
      { id: 55, name: "Ensalada Formagio y Nochi", price: 130, ingredients: "Lechuga, jitomate cherry, queso de cabra y nuez picada." },
      { id: 56, name: "Ensalada de Atún", price: 130, ingredients: "Lechuga, espinacas, pasta, zanahoria, pepino, atún, jitomate cherry, aceituna negra y aguacate." },
      { id: 57, name: "Ensalada Escandinavia", price: 145, ingredients: "Lechuga, jitomate cherry, láminas de salmón ahumado, pan crujiente, queso philadelphia y cebollín.", tags: ["Premium"], image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600" },
    ],
  },
  sopas: {
    title: "Sopas",
    subtitle: "Caldos reconfortantes",
    icon: "Soup",
    items: [
      { id: 60, name: "Sopa Azteca", price: 85, ingredients: "Tradicional sopa mexicana con tortilla, aguacate y queso." },
      { id: 61, name: "Sopa de Champiñón", price: 89, ingredients: "Crema de champiñones frescos." },
      { id: 62, name: "Sopa de Cebolla", price: 85, ingredients: "Sopa francesa de cebolla gratinada." },
      { id: 63, name: "Consomé Mariabela", price: 90, ingredients: "Consomé de pollo, verduras, arroz, queso blanco y aguacate.", tags: ["De la Casa"] },
    ],
  },
  paninis: {
    title: "Paninis & Hamburguesas",
    subtitle: "Especialidades para el mediodía",
    icon: "Sandwich",
    items: [
      { id: 70, name: "Panini de Jamón de Pavo", price: 130, ingredients: "Pan artesanal con mayonesa, pepino, jitomate, germen, lechuga, jamón de pavo y queso panela." },
      { id: 71, name: "Panini de Pechuga Asada", price: 145, ingredients: "Pan artesanal con mayonesa, pepino, jitomate, germen, lechuga y pechuga asada.", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600" },
      { id: 72, name: "Panini Tres Quesos", price: 145, ingredients: "Pan artesanal con mayonesa, pepino, jitomate, germen, lechuga, queso panela, mozzarella y manchego.", tags: ["Vegetariano"] },
      { id: 73, name: "Panini de Arrachera", price: 155, ingredients: "Pan artesanal con mayonesa, pepino, jitomate, germen, lechuga y arrachera.", tags: ["Premium"] },
      { id: 74, name: "Panini de Jamón Serrano", price: 145, ingredients: "Pan artesanal con mayonesa, pepino, jitomate, germen, lechuga y jamón serrano." },
      { id: 75, name: "Club Sandwich Mariabela", price: 125, ingredients: "Pan de caja, mayonesa, pepino, jitomate, germen, jamón de pavo, pechuga asada y papas a la francesa.", tags: ["De la Casa"] },
      { id: 76, name: "Hamburguesa Clásica", price: 145, ingredients: "Pan brioche, carne de res 100%, cebollitas caramelizadas, jitomate, lechuga y 130g de papas.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600" },
      { id: 77, name: "Hamburguesa Mariabela", price: 197, ingredients: "Pan brioche, 200g de arrachera, guacamole, mermelada de tocino, queso fundido, aros de cebolla, jitomate, lechuga y mayonesa del chef con papas.", tags: ["Best Seller"], image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=600" },
    ],
  },
  pastas: {
    title: "Pastas",
    subtitle: "Recetas artesanales de la tradición italiana",
    icon: "Pizza",
    items: [
      { id: 80, name: "Lasaña Boloñesa", price: 175, ingredients: "Receta secreta de la casa con carne de res, pomodoro y mozzarella gratinada.", tags: ["Best Seller"], image: "https://images.unsplash.com/photo-1502998070258-dc1338445ac2?q=80&w=600" },
      { id: 81, name: "Pasta Alfredo", price: 95, ingredients: "Pasta larga a base de crema, vino blanco, parmesano, sal y pimienta." },
      { id: 82, name: "Pasta Carbonara", price: 115, ingredients: "Pasta larga con tocino, vino blanco, crema, claras de huevo y queso parmesano.", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=600" },
      { id: 83, name: "Pasta Crema di Funghi", price: 120, ingredients: "Pasta corta, crema, vino blanco, queso parmesano y champiñones." },
      { id: 84, name: "Frutti di Mare", price: 170, ingredients: "Camarones, mejillones, calamares, ajo, vino blanco y queso parmesano.", tags: ["Premium"], image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=600" },
      { id: 85, name: "Bella Vista", price: 155, ingredients: "Camarones, aceite de olivo, ajo, vino blanco en salsa rosa." },
      { id: 86, name: "Boloñesa", price: 120, ingredients: "Carne molida de res, aceite de olivo, ajo, pomodoro, finas hierbas y vino tinto." },
      { id: 87, name: "Arrabiata", price: 110, ingredients: "Salsa de jitomate, albahaca y picante.", tags: ["Picante"] },
      { id: 88, name: "Pomodoro", price: 105, ingredients: "Salsa de jitomate, hojas de albahaca y queso parmesano." },
      { id: 89, name: "Al Pesto", price: 115, ingredients: "Salsa al pesto, albahaca, aceite de olivo, nuez, piñón y queso parmesano." },
      { id: 90, name: "Putanesca", price: 99, ingredients: "Aceituna negra, alcaparra, ajo, aceite de olivo y salsa pomodoro arrabiata." },
      { id: 91, name: "Cuatro Quesos", price: 120, ingredients: "Salsa a los cuatro quesos." },
      { id: 92, name: "Pesto y Tonno", price: 125, ingredients: "Salsa al pesto, jitomate cherry y atún.", tags: ["Gourmet"] },
      { id: 93, name: "Campirana", price: 110, ingredients: "Brócoli, pollo, ajo, vino blanco y queso parmesano." },
      { id: 94, name: "Pasta Salmone", price: 130, ingredients: "Salmón, crema, cebollín, vino blanco, cebolla, ajo y queso parmesano.", tags: ["Gourmet"], image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=600" },
      { id: 95, name: "Aglio e Olio", price: 95, ingredients: "Aceite de olivo, ajo, peperoncino y mantequilla." },
      { id: 96, name: "All Burro", price: 90, ingredients: "Mantequilla, aceite de olivo y queso parmesano." },
      { id: 97, name: "Pasta Mariabela", price: 160, ingredients: "Aceituna negra, ajo, alcaparra, arrabiata, camarones, almejas y pescado.", tags: ["De la Casa"] },
      { id: 98, name: "Pasta Arrabiata Especial", price: 145, ingredients: "Salsa de jitomate, tocino, arrabiata, albahaca, vino blanco, ajo y queso parmesano." },
      { id: 99, name: "Vegetariana", price: 105, ingredients: "Verduras mixtas, ajo, aceite de olivo y queso parmesano.", tags: ["Vegetariano"] },
    ],
  },
  pizzas: {
    title: "Pizzas",
    subtitle: "Masa delgada y crujiente al horno",
    icon: "Flame",
    items: [
      { id: 100, name: "Pizza Peperoni", price: 99, ingredients: "Tomate, mozzarella y peperoni.", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600" },
      { id: 101, name: "Pizza Prosciutto", price: 110, ingredients: "Tomate, mozzarella y jamón serrano.", tags: ["Italia"], image: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=600" },
      { id: 102, name: "Pizza Hawaiana", price: 99, ingredients: "Tomate, mozzarella, jamón y piña." },
      { id: 103, name: "Pizza Camarón", price: 160, ingredients: "Tomate, mozzarella, camarón, pimiento morrón y cebolla.", tags: ["Premium"] },
      { id: 104, name: "Pizza Cuatro Quesos", price: 110, ingredients: "Tomate, mozzarella, gouda, parmesano y manchego.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600" },
      { id: 105, name: "Pizza Boloñesa", price: 120, ingredients: "Tomate, mozzarella, boloñesa, jalapeño y aguacate." },
      { id: 106, name: "Pizza Napolitana", price: 110, ingredients: "Tomate, mozzarella, peperoni, champiñón, cebolla y jalapeño." },
      { id: 107, name: "Pizza Mariabela", price: 110, ingredients: "Tomate, mozzarella, tocino, peperoni, pimiento morrón y cebolla.", tags: ["De la Casa"] },
      { id: 108, name: "Pizza Focossa", price: 115, ingredients: "Tomate, cebolla, chorizo, cebolla y jalapeño.", tags: ["Picante"] },
    ],
  },
  especialidades: {
    title: "Especialidades",
    subtitle: "Creaciones del Chef",
    icon: "Award",
    items: [
      { id: 110, name: "Milanesa Natural", price: 155, ingredients: "Milanesa de res o pollo 180g con verduras cocidas y pasta al burro." },
      { id: 111, name: "Milanesa Gratinada", price: 165, ingredients: "Milanesa de res 180g con queso manchego gratinado, ensalada y papas." },
      { id: 112, name: "Milanesa Napolitana", price: 165, ingredients: "Milanesa de res 180g bañada en salsa pomodoro con mozzarella gratinada y verduras.", image: "https://images.unsplash.com/photo-1632778149975-420e0e75ee6d?q=80&w=600" },
      { id: 113, name: "Milanesa a la Boloñesa", price: 190, ingredients: "Bañada con salsa boloñesa y queso gratinado con pasta al burro y ensalada.", tags: ["Premium"] },
      { id: 114, name: "Pechuga a la Parmesana", price: 150, ingredients: "Milanesa de pollo, salsa de tomate gratinada con queso parmesano, papas y ensalada." },
      { id: 115, name: "Pechuga al Limón", price: 155, ingredients: "Salsa cremosa con jugo de limón y vino blanco con ensalada y papas." },
      { id: 116, name: "Pechuga al Funghi", price: 165, ingredients: "Salsa cremosa con champiñones y vino blanco, pasta al burro y ensalada." },
      { id: 117, name: "Filete de Pescado", price: 185, ingredients: "Sugerencia del chef.", tags: ["Chef"] },
      { id: 118, name: "Melanzane alla Parmigiana", price: 120, ingredients: "Finas rebanadas de berenjena bañadas con salsa de tomate y parmesano gratinado.", tags: ["Vegetariano"], image: "https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?q=80&w=600" },
      { id: 119, name: "Portobello Relleno", price: 110, ingredients: "Relleno de espinaca, morrón, cebolla, crema, vino blanco y queso gratinado.", tags: ["Vegetariano"] },
      { id: 120, name: "Alambre de Res", price: 145, ingredients: "Trozos de bistec de res, cebolla, morrón, champiñón y queso gratinado con papas o ensalada." },
      { id: 121, name: "Rollitos de Carne", price: 150, ingredients: "Rollitos de res rellenos de espinaca y queso manchego con pasta al burro o ensalada." },
      { id: 122, name: "Pechuga Cordon Bleu", price: 155, ingredients: "Pechuga de pollo asada rellena de jamón de pavo y queso manchego con papas o ensalada.", tags: ["Clásico"] },
      { id: 123, name: "Medallón de Atún", price: 195, ingredients: "A las finas hierbas, mantequilla negra, aceite de olivo y ajo con pasta al burro o ensalada.", tags: ["Premium"] },
    ],
  },
  cortes: {
    title: "Cortes Selectos",
    subtitle: "Acompañados de papa al horno y verduras",
    icon: "Beef",
    items: [
      { id: 130, name: "Salmón al Limón", price: 245, ingredients: "280g de salmón fresco en salsa al limón con ensalada y pasta al burro.", tags: ["Recomendado"], image: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=600" },
      { id: 131, name: "New York 350g", price: 295, ingredients: "Corte premium acompañado de papa al horno y verduras a la mantequilla.", tags: ["Premium"] },
      { id: 132, name: "Rib Eye 350g", price: 295, ingredients: "Corte premium acompañado de papa al horno y verduras a la mantequilla.", tags: ["Premium"], image: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=600" },
      { id: 133, name: "Arrachera Premium 300g", price: 245, ingredients: "Arrachera de primera acompañada de papa al horno y verduras a la mantequilla.", tags: ["Favorito"] },
    ],
  },
  bebidas: {
    title: "Bebidas",
    subtitle: "Refrescantes y Especiales",
    icon: "Wine",
    items: [
      { id: 140, name: "Jugo Natural 300ml", price: 45, ingredients: "Naranja o verde." },
      { id: 141, name: "Frapuccino", price: 55, ingredients: "Vainilla, rompope, crema irlandesa, caramelo, moka, cajeta, amaretto, mango, fresa, sandía, mora azul o piña colada." },
      { id: 142, name: "Frappe", price: 55, ingredients: "Vainilla, chocolate o fresa." },
      { id: 143, name: "Smoothie", price: 50, ingredients: "Base de agua con frutas frescas." },
      { id: 144, name: "Malteada", price: 50, ingredients: "Base de leche y helado." },
      { id: 145, name: "Soda Italiana", price: 85, ingredients: "Refrescante mezcla de jarabe y agua mineral." },
      { id: 146, name: "Licuado", price: 35, ingredients: "Fresa, plátano, chocolate, cajeta o nuez (+$15)." },
      { id: 147, name: "Tarro de Agua del Día", price: 50, ingredients: "Agua fresca de temporada." },
      { id: 148, name: "Refrescos", price: 45, ingredients: "Variedad de refrescos." },
      { id: 149, name: "Naranjada", price: 60, ingredients: "Naranjada natural." },
      { id: 150, name: "Corona", price: 60, ingredients: "Cerveza Corona." },
      { id: 151, name: "Modelo", price: 60, ingredients: "Cerveza Modelo." },
      { id: 152, name: "Ultra", price: 75, ingredients: "Cerveza Ultra." },
      { id: 153, name: "Heineken", price: 70, ingredients: "Cerveza Heineken." },
      { id: 154, name: "Tarro Michelado", price: 25, ingredients: "Jugo de limón, sal y escarchado." },
      { id: 155, name: "Tarro Cubano", price: 35, ingredients: "Clamato, jugo de limón, salsa Maggi, salsa inglesa y tabasco." },
      { id: 156, name: "Copa de Vino", price: 85, ingredients: "Vino de la casa tinto o blanco.", image: "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?q=80&w=600" },
      { id: 157, name: "Copa de Clericot", price: 95, ingredients: "Vino tinto con fruta de temporada.", tags: ["Social"] },
      { id: 158, name: "Jarra de Clericot", price: 215, ingredients: "Vino tinto joven con fruta de temporada seleccionada.", tags: ["Para Compartir"], image: "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?q=80&w=600" },
      { id: 159, name: "Jarra de Agua del Día", price: 99, ingredients: "1.5 litros de agua fresca." },
      { id: 160, name: "Jarra de Naranjada", price: 120, ingredients: "1.5 litros de naranjada natural." },
      { id: 161, name: "Jarra de Limonada", price: 110, ingredients: "1.5 litros de limonada." },
    ],
  },
  calientes: {
    title: "Bebidas Calientes",
    subtitle: "Para reconfortar el alma",
    icon: "Coffee",
    items: [
      { id: 170, name: "Espresso", price: 25, ingredients: "Shot de espresso." },
      { id: 171, name: "Latte", price: 25, ingredients: "Espresso con leche vaporizada." },
      { id: 172, name: "Espresso Doble", price: 30, ingredients: "Doble shot de espresso." },
      { id: 173, name: "Cortado", price: 30, ingredients: "Espresso con un toque de leche." },
      { id: 174, name: "Café de Olla", price: 25, ingredients: "Café tradicional mexicano.", tags: ["México"] },
      { id: 175, name: "Café Americano", price: 35, ingredients: "Espresso con agua caliente." },
      { id: 176, name: "Chocolate Abuelita", price: 45, ingredients: "Chocolate tradicional mexicano.", tags: ["México"] },
      { id: 177, name: "Capuchino", price: 40, ingredients: "Espresso, leche vaporizada y espuma." },
      { id: 178, name: "Capuchino de Sabores", price: 45, ingredients: "Cajeta, rompope, crema irlandesa, caramelo, moka o café espresso." },
      { id: 179, name: "Té", price: 25, ingredients: "Manzanilla, té verde, hierbabuena o limón." },
    ],
  },
  postres: {
    title: "Postres",
    subtitle: "El dulce final perfecto",
    icon: "IceCream",
    items: [
      { id: 180, name: "Helado Tempura", price: 65, ingredients: "Helado empanizado y frito.", image: "https://images.unsplash.com/photo-1488900128323-21503983a07e?q=80&w=600" },
      { id: 181, name: "Cheesecake", price: 65, ingredients: "Pay de queso cremoso.", tags: ["Favorito"] },
      { id: 182, name: "Pannacotta", price: 80, ingredients: "Postre italiano cremoso.", tags: ["Italia"] },
      { id: 183, name: "Flan Napolitano", price: 50, ingredients: "Flan tradicional casero." },
      { id: 184, name: "Pan Dulce", price: 25, ingredients: "Selección de pan dulce del día." },
      { id: 185, name: "Galletas con Chispas", price: 25, ingredients: "Galletas con chispas de chocolate." },
    ],
  },
  infantil: {
    title: "Menú Infantil",
    subtitle: "Para los pequeños de la casa",
    icon: "Baby",
    items: [
      { id: 190, name: "Pechuga Empanizada con Avena", price: 140, ingredients: "Acompañada de papas a la francesa o ensalada." },
      { id: 191, name: "Pasta Fusilli Alfredo", price: 140, ingredients: "Con cubitos de pollo asado." },
      { id: 192, name: "Taquitos de Arrachera", price: 140, ingredients: "Tres taquitos de arrachera con papas a la francesa." },
      { id: 193, name: "Mini Pizza", price: 97, ingredients: "Jamón, hawaiana o peperoni.", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600" },
      { id: 194, name: "Hamburguesa Infantil", price: 90, ingredients: "Con papas a la francesa." },
    ],
  },
}

// El acceso al panel de administración ahora se gestiona con autenticación
// real de Supabase (email + contraseña) y roles. Ya NO hay contraseña
// hardcodeada aquí. Ver: app/login, app/admin/layout.tsx y lib/services/auth.ts.
