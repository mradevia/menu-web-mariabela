// ============================================================================
//  DATOS DEL SITIO — Maria Bela
//  Este archivo contiene TODOS los datos por defecto del menú y del negocio.
//  El panel de administración (/admin) puede editar estos datos y los guarda
//  en el navegador (localStorage). Si no hay nada guardado, se usan estos.
//
//  Menú vigente: carta impresa de julio 2026 (MENU_MARIABELA).
//  Los `id` son estables: identifican al platillo en la base de datos
//  (products.legacy_id) y en el historial de pedidos. NO reutilizar un id
//  de un platillo dado de baja para uno nuevo.
//
//  OJO: con NEXT_PUBLIC_DATA_SOURCE=supabase la web NO lee este archivo, lee
//  la base de datos. Después de editarlo, publica con: npm run sync-menu
// ============================================================================

export interface Dish {
  id: number
  name: string
  price: number
  ingredients: string
  tags?: string[]
  image?: string
  /**
   * Subsección dentro de la categoría, como en la carta impresa.
   * Ej: Desayunos → "Huevos", "Omelettes", "Chilaquiles"…
   *
   * La web agrupa los platillos contiguos que comparten `group` y pinta un
   * subtítulo encima. Sin `group` -> el platillo se muestra sin subtítulo.
   * IMPORTANTE: los platillos de una misma subsección deben ir JUNTOS en el
   * array; el orden del array es el orden de la carta.
   */
  group?: string
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
    subtitle: "Selección de la casa",
    icon: "Coffee",
    items: [
      { id: 2, name: "Huevos al Gusto", price: 90, ingredients: "Salchicha, jamón, estrellados, rancheros, divorciados, a la mexicana, tocino o a la albañil.", group: "Huevos", image: "/IMAGENES COMIDA/huevos 2.png" },
      { id: 15, name: "Huevos Mariabela", price: 105, ingredients: "Huevos revueltos bañados en salsa de guajillo.", group: "Huevos", image: "/IMAGENES COMIDA/huevos mexicanos.png" },

      { id: 3, name: "Omelette al Gusto", price: 105, ingredients: "Champiñón, jamón, espinaca, tocino, quesos o chorizo.", group: "Omelettes" },
      { id: 4, name: "Omelette Gourmet", price: 119, ingredients: "Espinaca fresca y queso de cabra.", group: "Omelettes", tags: ["Gourmet"] },
      { id: 200, name: "Omelette de Bistec", price: 195, ingredients: "Tiras de bistec salteadas con papa, pimiento morrón, cebolla, champiñón, jitomate y queso mozzarella.", group: "Omelettes" },

      { id: 5, name: "Molletes Tradicionales (2 pzs.)", price: 85, ingredients: "Frijol refrito, jamón, queso gratinado y pico de gallo.", group: "Molletes", image: "/IMAGENES COMIDA/molletes.png" },
      { id: 6, name: "Molletes con Chorizo o Champiñón", price: 95, ingredients: "Frijol refrito, queso gratinado y tu elección de chorizo o champiñón.", group: "Molletes", image: "/IMAGENES COMIDA/molletes.png" },

      { id: 9, name: "Chilaquiles", price: 80, ingredients: "Verdes, rojos o divorciados.", group: "Chilaquiles", image: "/IMAGENES COMIDA/chilaquiles.png" },
      { id: 1, name: "Volcán de Chilaquiles", price: 129, ingredients: "Pan sourdough con orden de chilaquiles, pollo, crema y queso gratinado.", group: "Chilaquiles", tags: ["Estrella"], image: "/IMAGENES COMIDA/volcan.png" },

      { id: 11, name: "Enchiladas (3 pzas.)", price: 107, ingredients: "Verdes, rojas o divorciadas, rellenas de pollo.", group: "Enchiladas" },
      { id: 10, name: "Enfrijoladas (3 pzas.)", price: 107, ingredients: "Bañadas en salsa de frijol con crema, queso y aguacate.", group: "Enchiladas" },
      { id: 12, name: "Enchiladas Suizas (3 pzas.)", price: 135, ingredients: "Cubiertas con salsa suiza, queso gratinado y ajonjolí.", group: "Enchiladas", tags: ["Premium"] },
      { id: 201, name: "Enmoladas (3 pzas.)", price: 155, ingredients: "Tres piezas rellenas de pollo bañadas en mole. Acompañadas de crema, queso y cebolla.", group: "Enchiladas" },

      { id: 7, name: "Croissant de Jamón", price: 99, ingredients: "Jamón, queso panela, queso manchego, lechuga y jitomate.", group: "Panes & Sándwiches" },
      { id: 8, name: "Bagel de Jamón", price: 99, ingredients: "Bagel con huevo, jamón, queso manchego, queso panela, lechuga y jitomate.", group: "Panes & Sándwiches" },
      { id: 17, name: "Sándwich Gratinado", price: 107, ingredients: "Pan de caja con jamón, lechuga, jitomate, queso gratinado y huevo estrellado.", group: "Panes & Sándwiches" },
      { id: 14, name: "Desayuno Mariabela", price: 105, ingredients: "Orden de waffles acompañados con huevo estrellado o al gusto.", group: "Panes & Sándwiches", tags: ["De la Casa"], image: "/IMAGENES COMIDA/waffles.png" },

      { id: 202, name: "Desayuno Mexicano", price: 199, ingredients: "Pechuga o carne asada o fajitas de arrachera, longaniza, nopal asado y chilaquiles verdes.", group: "Especialidades", tags: ["De la Casa"] },
      { id: 203, name: "Tortilla Española", price: 120, ingredients: "Tradicional tortilla española preparada con papa y chorizo, acompañada de frijoles refritos.", group: "Especialidades" },
      { id: 22, name: "Pechuga Napolitana", price: 140, ingredients: "Pechuga asada bañada en salsa pomodoro con queso gratinado.", group: "Especialidades", tags: ["Premium"] },
      { id: 20, name: "Wraps", price: 95, ingredients: "Tortilla de harina u hoja de lechuga rellena de jitomate, cebolla, elote, champiñón, atún o pollo.", group: "Especialidades" },
      { id: 18, name: "Sincronizadas", price: 80, ingredients: "Dos tortillas de harina rellenas de jamón y queso manchego, acompañadas de salsa mexicana.", group: "Especialidades" },
      { id: 19, name: "Tacos Campestres", price: 95, ingredients: "Tres tacos preparados en hoja de lechuga con pollo, champiñón, elote y jitomate.", group: "Especialidades", tags: ["Light"] },
      { id: 21, name: "Árabe Mariabela", price: 99, ingredients: "Jamón de pavo, queso panela, manzana, lechuga y pepino.", group: "Especialidades" },
      { id: 23, name: "Sopesitos Sencillos (3 pzs.)", price: 85, ingredients: "Frijol refrito, crema, queso y lechuga.", group: "Especialidades", image: "/IMAGENES COMIDA/sopes.png" },
      { id: 16, name: "Sope Light", price: 95, ingredients: "Nopal con pollo deshebrado, bañado en salsa verde, lechuga y queso.", group: "Especialidades", tags: ["Light"] },
      { id: 24, name: "Sopesitos de Pollo o Carne Asada (3 pzs.)", price: 120, ingredients: "Frijol refrito, crema, queso y lechuga.", group: "Especialidades", image: "/IMAGENES COMIDA/sopes.png" },
      { id: 13, name: "Waffles Dulces", price: 85, ingredients: "Acompañados con frutos rojos, chocolate y crema dulce.", group: "Especialidades", image: "/IMAGENES COMIDA/waffles.png" },
      { id: 25, name: "Hotcakes", price: 75, ingredients: "Orden de 3 hotcakes esponjosos.", group: "Especialidades", image: "/IMAGENES COMIDA/HOTCAKES.png" },
    ],
  },
  entradas: {
    title: "Entradas",
    subtitle: "Para compartir al estilo de la casa",
    icon: "Utensils",
    items: [
      { id: 30, name: "Espinacas Mariabela", price: 90, ingredients: "Espinacas gratinadas con queso mozzarella y crema.", tags: ["Clásico"] },
      { id: 36, name: "Aros de Cebolla", price: 99, ingredients: "Crujientes aros de cebolla empanizados." },
      { id: 37, name: "Alitas Fritas", price: 155, ingredients: "Alitas tradicionales fritas.", tags: ["Hot"] },
      { id: 38, name: "Tiras de Pollo", price: 145, ingredients: "Tiras de pollo empanizadas y crujientes." },
      { id: 39, name: "Papas a la Francesa", price: 99, ingredients: "Papas doradas y crujientes." },
      { id: 40, name: "Boneless", price: 140, ingredients: "Boneless de pollo crujientes." },
      { id: 41, name: "Tabla Familiar de Especialidad", price: 157, ingredients: "Papas a la francesa, boneless y tiras de pollo.", tags: ["Para Compartir"] },
      { id: 33, name: "Guacamole", price: 100, ingredients: "Aguacate fresco preparado al momento." },
      { id: 34, name: "Guacamole con Arrachera", price: 150, ingredients: "Guacamole preparado al momento acompañado de 120 g de arrachera.", tags: ["Premium"] },
      { id: 32, name: "Papas al Ajo con Arrachera", price: 115, ingredients: "250 g de papas a la francesa sazonadas con ajo, chile de árbol, aceite de oliva y especias cajún. Acompañadas de 120 g de jugosa arrachera.", tags: ["Favorito"] },
    ],
  },
  ensaladas: {
    title: "Ensaladas",
    subtitle: "Frescura y sabor en cada bocado",
    icon: "Salad",
    items: [
      { id: 50, name: "Ensalada César", price: 115, ingredients: "Base de lechuga, queso parmesano, crotones, pechuga de pollo asada y aderezo césar." },
      { id: 51, name: "Ensalada Caprese", price: 110, ingredients: "Queso mozzarella, jitomate, hojas de albahaca y aceite de oliva.", tags: ["Italia"] },
      { id: 52, name: "Ensalada Frutal", price: 140, ingredients: "Base de lechuga, arándanos, ajonjolí caramelizado, semillas de girasol, betabel, manzana, pera, fresa, mango, germen de alfalfa, pasta y jitomate cherry.", tags: ["Fresh"] },
      { id: 53, name: "Ensalada Mariabela", price: 130, ingredients: "Base de lechuga, arándanos, fresa, queso de cabra, ajonjolí caramelizado y pechuga de pollo asada.", tags: ["De la Casa"] },
      { id: 56, name: "Ensalada de Atún", price: 135, ingredients: "Base de lechuga, espinaca, pasta, zanahoria, pepino, atún, jitomate cherry, aceitunas negras y aguacate." },
      { id: 57, name: "Ensalada Escandinavia", price: 145, ingredients: "Base de lechuga, jitomate cherry, láminas de salmón ahumado, pan crujiente, queso philadelphia y cebollín.", tags: ["Premium"] },

      { id: 204, name: "Pechuga de Pollo", price: 35, ingredients: "Complemento para cualquier ensalada.", group: "Proteína Extra" },
      { id: 205, name: "Carne Asada", price: 45, ingredients: "Complemento para cualquier ensalada.", group: "Proteína Extra" },
      { id: 206, name: "Arrachera", price: 50, ingredients: "Complemento para cualquier ensalada.", group: "Proteína Extra" },
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
      { id: 63, name: "Consomé Mariabela", price: 107, ingredients: "Consomé de pollo con verduras, arroz, queso blanco y aguacate.", tags: ["De la Casa"] },
    ],
  },
  paninis: {
    title: "Paninis & Hamburguesas",
    subtitle: "Especialidades para el mediodía",
    icon: "Sandwich",
    items: [
      { id: 70, name: "Panini de Jamón de Pavo y Queso", price: 135, ingredients: "Pan artesanal con mantequilla, mayonesa, pepino, jitomate, germen, lechuga, jamón de pavo y queso panela.", group: "Paninis" },
      { id: 71, name: "Panini de Pechuga Asada", price: 155, ingredients: "Pan artesanal con mantequilla, mayonesa, pepino, jitomate, germen, lechuga y pechuga de pollo asada.", group: "Paninis" },
      { id: 72, name: "Panini Tres Quesos", price: 145, ingredients: "Pan artesanal con mantequilla, mayonesa, pepino, jitomate, germen, lechuga, queso panela, pimiento morrón y manchego.", group: "Paninis", tags: ["Vegetariano"] },
      { id: 73, name: "Panini de Arrachera", price: 155, ingredients: "Pan artesanal con mantequilla, mayonesa, pepino, jitomate, germen, lechuga y arrachera.", group: "Paninis", tags: ["Premium"] },
      { id: 74, name: "Panini de Jamón Serrano", price: 150, ingredients: "Pan artesanal con mantequilla, mayonesa, pepino, jitomate, germen, lechuga y jamón serrano.", group: "Paninis" },

      { id: 75, name: "Club Sandwich Mariabela", price: 130, ingredients: "Pan de caja con mayonesa, pepino, jitomate, germen, jamón de pavo, pechuga asada y papas a la francesa.", group: "Sándwiches", tags: ["De la Casa"] },

      { id: 76, name: "Hamburguesa Clásica", price: 150, ingredients: "Pan brioche, carne de res 100%, cebolla caramelizada, jitomate, lechuga y 130 g de papas a la francesa.", group: "Hamburguesas" },
      { id: 77, name: "Hamburguesa Mariabela", price: 205, ingredients: "Pan brioche con 200 g de arrachera, guacamole, mermelada de tocino, queso fundido, aros de cebolla, jitomate, lechuga, mayonesa del chef y 130 g de papas a la francesa.", group: "Hamburguesas", tags: ["Best Seller"] },
    ],
  },
  pastas: {
    title: "Pastas",
    subtitle: "Recetas artesanales de la tradición italiana",
    icon: "Pizza",
    items: [
      { id: 80, name: "Lasaña Boloñesa", price: 195, ingredients: "Receta secreta de la casa con carne de res, pomodoro y mozzarella gratinada.", tags: ["Best Seller"] },
      { id: 81, name: "Pasta Alfredo", price: 100, ingredients: "Pasta larga con crema, vino blanco y queso parmesano." },
      { id: 82, name: "Pasta Carbonara", price: 115, ingredients: "Pasta larga con tocino, vino blanco, crema y queso parmesano.", image: "/IMAGENES COMIDA/spaguetti.png" },
      { id: 83, name: "Pasta Crema di Funghi", price: 130, ingredients: "Pasta corta en salsa cremosa con vino blanco, queso parmesano y champiñones." },
      { id: 84, name: "Frutti di Mare", price: 170, ingredients: "Camarones y pescado al ajo, vino blanco y queso parmesano.", tags: ["Premium"] },
      { id: 85, name: "Bella Vista", price: 160, ingredients: "Camarones salteados con aceite de oliva, ajo, vino blanco y salsa rosa." },
      { id: 86, name: "Boloñesa", price: 135, ingredients: "Carne molida de res en salsa pomodoro con aceite de oliva, ajo, vino tinto y finas hierbas." },
      { id: 87, name: "Arrabbiata", price: 110, ingredients: "Salsa pomodoro con albahaca y un toque picante.", tags: ["Picante"] },
      { id: 88, name: "Pomodoro", price: 105, ingredients: "Salsa tradicional de jitomate, albahaca fresca y queso parmesano." },
      { id: 89, name: "Al Pesto", price: 115, ingredients: "Salsa pesto con albahaca, aceite de oliva, nuez, piñón y queso parmesano." },
      { id: 90, name: "Puttanesca", price: 99, ingredients: "Aceitunas negras, alcaparras, ajo, aceite de oliva y salsa pomodoro." },
      { id: 91, name: "Cuatro Quesos", price: 125, ingredients: "Salsa cremosa a los cuatro quesos." },
      { id: 92, name: "Pesto y Tonno", price: 125, ingredients: "Salsa pesto con jitomate cherry y atún.", tags: ["Gourmet"] },
      { id: 93, name: "Campirana", price: 110, ingredients: "Brócoli, pollo, ajo, vino blanco y queso parmesano." },
      { id: 94, name: "Pasta Salmone", price: 145, ingredients: "Salmón, crema, cebollín, cebolla, ajo, vino blanco y queso parmesano.", tags: ["Gourmet"] },
      { id: 96, name: "Al Burro", price: 95, ingredients: "Mantequilla, aceite de oliva y queso parmesano." },
      { id: 97, name: "Pasta Mariabela", price: 170, ingredients: "Aceitunas negras, ajo, alcaparras, salsa arrabbiata, camarones, almejas y pescado.", tags: ["De la Casa"] },
      { id: 98, name: "Arrabbiata Especial", price: 145, ingredients: "Salsa de jitomate con tocino, albahaca, vino blanco, ajo y queso parmesano." },
      { id: 95, name: "Aglio e Olio", price: 105, ingredients: "Aceite de oliva, ajo, peperoncino y mantequilla." },
      { id: 99, name: "Vegetariana", price: 105, ingredients: "Verduras mixtas salteadas con ajo, aceite de oliva y queso parmesano.", tags: ["Vegetariano"] },
    ],
  },
  pizzas: {
    title: "Pizzas",
    subtitle: "Masa delgada y crujiente al horno",
    icon: "Flame",
    items: [
      { id: 100, name: "Pizza Pepperoni", price: 120, ingredients: "Tomate, mozzarella y pepperoni." },
      { id: 106, name: "Pizza Napolitana", price: 130, ingredients: "Tomate, mozzarella, pepperoni, champiñón, cebolla y jalapeño." },
      { id: 101, name: "Pizza Prosciutto", price: 125, ingredients: "Tomate, mozzarella y jamón serrano.", tags: ["Italia"] },
      { id: 102, name: "Pizza Hawaiana", price: 125, ingredients: "Tomate, mozzarella, jamón y piña." },
      { id: 103, name: "Pizza Camarón", price: 170, ingredients: "Tomate, mozzarella, camarón, pimiento morrón y cebolla.", tags: ["Premium"], image: "/IMAGENES COMIDA/pizza camaron.png" },
      { id: 104, name: "Pizza Cuatro Quesos", price: 125, ingredients: "Tomate, mozzarella, gouda, parmesano y manchego." },
      { id: 105, name: "Pizza Boloñesa", price: 140, ingredients: "Tomate, mozzarella, salsa boloñesa, jalapeño y aguacate." },
      { id: 107, name: "Pizza Mariabela", price: 120, ingredients: "Tomate, mozzarella, tocino, pepperoni, pimiento morrón y cebolla.", tags: ["De la Casa"] },
      { id: 108, name: "Pizza Focaccia", price: 120, ingredients: "Tomate, cebolla, chorizo y jalapeño.", tags: ["Picante"] },
    ],
  },
  especialidades: {
    title: "Especialidades",
    subtitle: "De la cuccina",
    icon: "Award",
    items: [
      { id: 207, name: "Parrillada Mariabela", price: 550, ingredients: "Para compartir · 2 personas. Arrachera, pechuga de pollo asado, chorizo argentino, nopal asado, cebolla cambray, queso asadero y chicharrón.", tags: ["Para Compartir", "Estrella"] },
      { id: 208, name: "Pollo alla Peperonata", price: 190, ingredients: "Pechuga de pollo asada en salsa de jitomate, sazonada con pimiento morrón y queso parmesano. Acompañada de ensalada.", tags: ["Italia"] },
      { id: 130, name: "Salmón al Limón", price: 245, ingredients: "Salmón a la plancha con salsa cremosa de limón y vino blanco. Acompañado de ensalada fresca y pasta al burro.", tags: ["Recomendado"] },
      { id: 110, name: "Milanesa Natural", price: 155, ingredients: "Milanesa de res o pollo. Guarnición a elegir: papas a la francesa, ensalada o pasta." },
      { id: 111, name: "Milanesa Gratinada", price: 165, ingredients: "Milanesa de res o pollo cubierta con queso manchego gratinado. Guarnición a elegir: papas a la francesa, ensalada o pasta." },
      { id: 113, name: "Milanesa a la Boloñesa", price: 190, ingredients: "Milanesa de res o pollo cubierta con salsa boloñesa casera y queso gratinado. Guarnición a elegir: papas a la francesa, ensalada o pasta.", tags: ["Premium"] },
      { id: 114, name: "Pechuga a la Parmesana", price: 150, ingredients: "Pechuga empanizada con salsa pomodoro y queso parmesano gratinado. Acompañada de papas a la francesa y ensalada." },
      { id: 115, name: "Pechuga al Limón", price: 155, ingredients: "Salsa cremosa de limón y vino blanco. Acompañada de papas a la francesa y ensalada." },
      { id: 116, name: "Pechuga al Funghi", price: 165, ingredients: "Pechuga bañada en salsa cremosa de champiñones y vino blanco. Incluye pasta al burro y ensalada." },
      { id: 117, name: "Filete de Pescado", price: 185, ingredients: "Con guarnición del día.", tags: ["Chef"] },
      { id: 118, name: "Melanzane alla Parmigiana", price: 120, ingredients: "Láminas de berenjena gratinadas con salsa pomodoro y queso parmesano.", tags: ["Vegetariano"] },
      { id: 119, name: "Portobello Relleno", price: 110, ingredients: "Relleno de espinaca, pimiento morrón, cebolla, crema y queso gratinado.", tags: ["Vegetariano"] },
      { id: 120, name: "Alambre de Res", price: 145, ingredients: "Bistec salteado con pimiento morrón, cebolla, champiñones y queso fundido. Incluye papas a la francesa o ensalada." },
      { id: 121, name: "Rollitos de Res Rellenos de Espinaca", price: 150, ingredients: "Rellenos de espinaca y queso manchego. Acompañados de pasta al burro o ensalada." },
      { id: 122, name: "Pechuga Cordon Bleu", price: 155, ingredients: "Rellena de jamón de pavo y queso manchego. Acompañada de papas a la francesa o ensalada.", tags: ["Clásico"] },
      { id: 123, name: "Medallón de Atún", price: 195, ingredients: "Sellado a las finas hierbas con mantequilla negra, aceite de oliva y ajo. Acompañado de pasta al burro o ensalada.", tags: ["Premium"] },
    ],
  },
  cortes: {
    title: "Cortes Selectos",
    subtitle: "Guarnición a elegir: papas a la francesa o pasta",
    icon: "Beef",
    items: [
      { id: 131, name: "New York (350 g)", price: 295, ingredients: "Corte premium a la parrilla. Guarnición a elegir: papas a la francesa o pasta.", tags: ["Premium"] },
      { id: 132, name: "Rib Eye (350 g)", price: 295, ingredients: "Corte marmoleado al grill. Guarnición a elegir: papas a la francesa o pasta.", tags: ["Premium"] },
      { id: 133, name: "Arrachera Premium (300 g)", price: 245, ingredients: "Marinada y asada al punto. Guarnición a elegir: papas a la francesa o pasta.", tags: ["Favorito"] },
    ],
  },
  bebidas: {
    title: "Bebidas",
    subtitle: "Refrescantes y Especiales",
    icon: "Wine",
    items: [
      { id: 148, name: "Refrescos", price: 30, ingredients: "Variedad de refrescos.", group: "Bebidas Frías" },
      { id: 149, name: "Naranjada", price: 60, ingredients: "Naranjada natural.", group: "Bebidas Frías" },
      { id: 209, name: "Botella de Agua", price: 25, ingredients: "Agua natural embotellada.", group: "Bebidas Frías" },
      { id: 145, name: "Soda Italiana", price: 85, ingredients: "Refrescante mezcla de jarabe y agua mineral.", group: "Bebidas Frías" },
      { id: 141, name: "Frappés", price: 55, ingredients: "Frappuccino, vainilla, rompope, crema irlandesa, caramelo, moka, cajeta o amaretto.", group: "Bebidas Frías" },
      { id: 143, name: "Smoothies", price: 50, ingredients: "Mango, fresa, sandía, mora azul o piña colada.", group: "Bebidas Frías" },
      { id: 144, name: "Malteadas", price: 60, ingredients: "Vainilla, chocolate o fresa. Base de leche y helado. Leche deslactosada +$10.", group: "Bebidas Frías", image: "/IMAGENES COMIDA/malteada.png" },

      { id: 159, name: "Jarra de Agua del Día", price: 99, ingredients: "Agua fresca de temporada para compartir.", group: "Para Compartir" },
      { id: 160, name: "Jarra de Naranjada", price: 140, ingredients: "Naranjada natural para compartir.", group: "Para Compartir" },
      { id: 161, name: "Jarra de Limonada", price: 125, ingredients: "Limonada natural para compartir.", group: "Para Compartir" },
      { id: 158, name: "Jarra de Clericot", price: 150, ingredients: "Vino tinto con fruta de temporada.", group: "Para Compartir" },

      { id: 151, name: "Modelo", price: 60, ingredients: "Cerveza Modelo.", group: "Cervezas y Micheladas" },
      { id: 150, name: "Corona", price: 60, ingredients: "Cerveza Corona.", group: "Cervezas y Micheladas" },
      { id: 152, name: "Ultra", price: 75, ingredients: "Cerveza Ultra.", group: "Cervezas y Micheladas" },
      { id: 210, name: "Michelada Chica", price: 65, ingredients: "Preparada con jugo de limón, sal y escarchado.", group: "Cervezas y Micheladas" },
      { id: 211, name: "Michelada 1 Litro", price: 100, ingredients: "Michelada de un litro para compartir.", group: "Cervezas y Micheladas" },
      { id: 154, name: "Tarro Michelado", price: 35, ingredients: "Jugo de limón, sal y escarchado.", group: "Cervezas y Micheladas" },
      { id: 155, name: "Tarro Cubano", price: 35, ingredients: "Clamato, jugo de limón, salsa Maggi, salsa inglesa y tabasco.", group: "Cervezas y Micheladas" },

      { id: 212, name: "Paloma", price: 125, ingredients: "Coctelería de la casa.", group: "Coctelería" },
      { id: 213, name: "Azulito", price: 120, ingredients: "Coctelería de la casa.", group: "Coctelería" },
      { id: 214, name: "Clericot", price: 105, ingredients: "Coctelería de la casa.", group: "Coctelería" },

      { id: 156, name: "Copa de Vino de la Casa", price: 95, ingredients: "Vino de la house tinto o blanco. Vinos sujetos a disponibilidad.", group: "Vino" },
      { id: 157, name: "Copa de Clericot", price: 95, ingredients: "Vino tinto con fruta de temporada.", group: "Vino", tags: ["Social"] },

      { id: 140, name: "Jugo de Naranja Chico", price: 35, ingredients: "Jugo de naranja natural.", group: "Jugos" },
      { id: 215, name: "Jugo de Naranja Grande", price: 45, ingredients: "Jugo de naranja natural.", group: "Jugos" },
      { id: 216, name: "Jugo Verde", price: 50, ingredients: "Jugo verde natural.", group: "Jugos" },
      { id: 217, name: "Antigripal", price: 50, ingredients: "Jugo antigripal natural.", group: "Jugos" },

      { id: 146, name: "Licuado de Fresa", price: 45, ingredients: "Leche deslactosada +$10.", group: "Licuados" },
      { id: 218, name: "Licuado de Plátano", price: 40, ingredients: "Leche deslactosada +$10.", group: "Licuados" },
      { id: 219, name: "Licuado de Chocolate", price: 40, ingredients: "Leche deslactosada +$10.", group: "Licuados" },
      { id: 220, name: "Licuado de Cajeta", price: 40, ingredients: "Leche deslactosada +$10.", group: "Licuados" },
      { id: 221, name: "Licuado de Nuez", price: 50, ingredients: "Leche deslactosada +$10.", group: "Licuados" },
    ],
  },
  calientes: {
    title: "Bebidas Calientes",
    subtitle: "Para reconfortar el alma",
    icon: "Coffee",
    items: [
      { id: 171, name: "Latte", price: 25, ingredients: "Espresso con leche vaporizada." },
      { id: 170, name: "Espresso", price: 25, ingredients: "Shot de espresso." },
      { id: 172, name: "Espresso Doble", price: 30, ingredients: "Doble shot de espresso." },
      { id: 173, name: "Cortado", price: 30, ingredients: "Espresso con un toque de leche." },
      { id: 174, name: "Café de Olla", price: 25, ingredients: "Café tradicional mexicano.", tags: ["México"] },
      { id: 175, name: "Café Americano", price: 35, ingredients: "Espresso con agua caliente." },
      { id: 176, name: "Chocolate Abuelita", price: 45, ingredients: "Chocolate tradicional mexicano.", tags: ["México"] },
      { id: 177, name: "Capuchino", price: 40, ingredients: "Espresso, leche vaporizada y espuma." },
      { id: 178, name: "Capuchino de Sabores", price: 50, ingredients: "Cajeta, rompope, crema irlandesa, caramelo, moka o café espresso." },
      { id: 179, name: "Té", price: 25, ingredients: "Manzanilla, té verde, hierbabuena o limón." },
    ],
  },
  postres: {
    title: "Postres",
    subtitle: "El dulce final perfecto",
    icon: "IceCream",
    items: [
      { id: 180, name: "Helado Tempura", price: 85, ingredients: "Helado frito con cobertura crujiente." },
      { id: 222, name: "Pastel del Día", price: 75, ingredients: "Rebanada de pastel del día." },
      { id: 182, name: "Panna Cotta", price: 90, ingredients: "Postre italiano cremoso.", tags: ["Italia"] },
      { id: 183, name: "Flan Napolitano", price: 90, ingredients: "Flan tradicional casero." },

      { id: 184, name: "Pan Dulce", price: 25, ingredients: "Selección de pan dulce del día.", group: "Pan" },
      { id: 223, name: "Pan con Mantequilla", price: 15, ingredients: "Pan tostado con mantequilla.", group: "Pan" },
      { id: 185, name: "Galletas con Chispas de Chocolate", price: 25, ingredients: "Galletas con chispas de chocolate.", group: "Pan" },

      { id: 224, name: "Fruta Chica", price: 35, ingredients: "Yogurt, granola y miel.", group: "Fruta", tags: ["Light"] },
      { id: 225, name: "Fruta Grande", price: 45, ingredients: "Yogurt, granola y miel.", group: "Fruta", tags: ["Light"] },
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
      { id: 193, name: "Mini Pizza", price: 95, ingredients: "Jamón, hawaiana o pepperoni." },
      { id: 194, name: "Hamburguesa Infantil", price: 100, ingredients: "Con papas a la francesa." },
    ],
  },
}

// El acceso al panel de administración ahora se gestiona con autenticación
// real de Supabase (email + contraseña) y roles. Ya NO hay contraseña
// hardcodeada aquí. Ver: app/login, app/admin/layout.tsx y lib/services/auth.ts.
