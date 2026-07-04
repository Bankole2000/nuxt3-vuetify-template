export interface Person {
  id: string
  firstName: string
  lastName: string
  birthYear: number
  deathYear?: number
  gender: 'M' | 'F' | 'other'
}

export interface Partnership {
  id: string
  personA: string
  personB: string
  marriageYear?: number
  ended?: boolean   // divorced / widowed / partnership ended
}

export interface ParentChild {
  parentId: string
  childId: string
}

export interface FamilyData {
  persons: Person[]
  partnerships: Partnership[]
  parentChild: ParentChild[]
}

// ─── Shared dataset with polygamous scenarios ─────────────────────────────────
// Harold Webb had a first wife (Edna) and a second wife (Ruth) after Edna died.
// Frank Webb had two concurrent partners (Lena and Nora) — polygamous scenario.
// Victor Shaw had a second relationship with Ada after Mabel's death.

export const familyData: FamilyData = {
  persons: [
    // Gen 3 — great-grandparents
    { id: 'harold',  firstName: 'Harold',   lastName: 'Webb',    birthYear: 1905, deathYear: 1978, gender: 'M' },
    { id: 'edna',    firstName: 'Edna',     lastName: 'Webb',    birthYear: 1907, deathYear: 1950, gender: 'F' },  // died young
    { id: 'ruth',    firstName: 'Ruth',     lastName: 'Webb',    birthYear: 1912, deathYear: 1990, gender: 'F' },  // Harold's second wife
    { id: 'victor',  firstName: 'Victor',   lastName: 'Shaw',    birthYear: 1903, deathYear: 1971, gender: 'M' },
    { id: 'mabel',   firstName: 'Mabel',    lastName: 'Shaw',    birthYear: 1910, deathYear: 1965, gender: 'F' },
    { id: 'ada',     firstName: 'Ada',      lastName: 'Shaw',    birthYear: 1918, deathYear: 1998, gender: 'F' },  // Victor's second partner after Mabel
    // Gen 2 — grandparents
    { id: 'arthur',  firstName: 'Arthur',   lastName: 'Webb',    birthYear: 1930, deathYear: 2005, gender: 'M' },
    { id: 'dorothy', firstName: 'Dorothy',  lastName: 'Webb',    birthYear: 1933, deathYear: 2010, gender: 'F' },
    { id: 'frank',   firstName: 'Frank',    lastName: 'Webb',    birthYear: 1932, deathYear: 2018, gender: 'M' },
    { id: 'lena',    firstName: 'Lena',     lastName: 'Webb',    birthYear: 1934, gender: 'F' },                   // Frank's first concurrent partner
    { id: 'nora',    firstName: 'Nora',     lastName: 'Webb',    birthYear: 1936, deathYear: 2008, gender: 'F' }, // Frank's second concurrent partner
    { id: 'reg',     firstName: 'Reg',      lastName: 'Shaw',    birthYear: 1922, deathYear: 2001, gender: 'M' }, // Harold + Ruth's son
    // Gen 1 — focus's generation
    { id: 'george',  firstName: 'George',   lastName: 'Webb',    birthYear: 1958, gender: 'M' },
    { id: 'helen',   firstName: 'Helen',    lastName: 'Webb',    birthYear: 1960, gender: 'F' },
    { id: 'martin',  firstName: 'Martin',   lastName: 'Webb',    birthYear: 1961, gender: 'M' },
    { id: 'susan',   firstName: 'Susan',    lastName: 'Turner',  birthYear: 1962, gender: 'F' },
    { id: 'richard', firstName: 'Richard',  lastName: 'Turner',  birthYear: 1959, gender: 'M' },
    { id: 'paul',    firstName: 'Paul',     lastName: 'Webb',    birthYear: 1956, gender: 'M' },  // Frank + Lena
    { id: 'janet',   firstName: 'Janet',    lastName: 'Webb',    birthYear: 1957, gender: 'F' },
    { id: 'diane',   firstName: 'Diane',    lastName: 'Webb',    birthYear: 1958, gender: 'F' },  // Frank + Nora (half-sibling of Paul)
    { id: 'dorothy2',firstName: 'Dorothy',  lastName: 'Shaw',    birthYear: 1933, deathYear: 2010, gender: 'F' }, // Victor + Mabel
    // Gen 0 — children
    { id: 'claire',  firstName: 'Claire',   lastName: 'Webb',    birthYear: 1985, gender: 'F' },
    { id: 'james',   firstName: 'James',    lastName: 'Webb',    birthYear: 1987, gender: 'M' },
    { id: 'sophie',  firstName: 'Sophie',   lastName: 'Webb',    birthYear: 1988, gender: 'F' },
    { id: 'lily',    firstName: 'Lily',     lastName: 'Webb',    birthYear: 1990, gender: 'F' },
    { id: 'tom',     firstName: 'Tom',      lastName: 'Turner',  birthYear: 1986, gender: 'M' },
    { id: 'emma',    firstName: 'Emma',     lastName: 'Turner',  birthYear: 1989, gender: 'F' },
    { id: 'kyle',    firstName: 'Kyle',     lastName: 'Webb',    birthYear: 1984, gender: 'M' },  // Paul + Janet
    // Gen -1 — grandchildren
    { id: 'oliver',  firstName: 'Oliver',   lastName: 'Webb',    birthYear: 2015, gender: 'M' },
    { id: 'grace',   firstName: 'Grace',    lastName: 'Webb',    birthYear: 2017, gender: 'F' },
  ],

  partnerships: [
    // Harold's two marriages
    { id: 'p1',  personA: 'harold', personB: 'edna',    marriageYear: 1928, ended: true },
    { id: 'p1b', personA: 'harold', personB: 'ruth',    marriageYear: 1953 },
    // Victor's two relationships
    { id: 'p2',  personA: 'victor', personB: 'mabel',   marriageYear: 1929, ended: true },
    { id: 'p2b', personA: 'victor', personB: 'ada',     marriageYear: 1967 },
    // Arthur + Dorothy
    { id: 'p3',  personA: 'arthur', personB: 'dorothy', marriageYear: 1955 },
    // Frank's two concurrent partners (polygamous)
    { id: 'p4a', personA: 'frank',  personB: 'lena',    marriageYear: 1955 },
    { id: 'p4b', personA: 'frank',  personB: 'nora',    marriageYear: 1957 },
    // Gen 1
    { id: 'p5',  personA: 'george', personB: 'helen',   marriageYear: 1983 },
    { id: 'p6',  personA: 'susan',  personB: 'richard', marriageYear: 1985 },
    { id: 'p7',  personA: 'paul',   personB: 'janet',   marriageYear: 1980 },
    // Gen 0
    { id: 'p8',  personA: 'james',  personB: 'sophie',  marriageYear: 2012 },
  ],

  parentChild: [
    // Harold + Edna → Arthur, Frank
    { parentId: 'harold', childId: 'arthur'  },
    { parentId: 'edna',   childId: 'arthur'  },
    { parentId: 'harold', childId: 'frank'   },
    { parentId: 'edna',   childId: 'frank'   },
    // Harold + Ruth → Reg (half-sibling of Arthur & Frank)
    { parentId: 'harold', childId: 'reg'     },
    { parentId: 'ruth',   childId: 'reg'     },
    // Victor + Mabel → Dorothy
    { parentId: 'victor', childId: 'dorothy' },
    { parentId: 'mabel',  childId: 'dorothy' },
    // Arthur + Dorothy → George, Martin, Susan
    { parentId: 'arthur',  childId: 'george'  },
    { parentId: 'dorothy', childId: 'george'  },
    { parentId: 'arthur',  childId: 'martin'  },
    { parentId: 'dorothy', childId: 'martin'  },
    { parentId: 'arthur',  childId: 'susan'   },
    { parentId: 'dorothy', childId: 'susan'   },
    // Frank + Lena → Paul
    { parentId: 'frank',  childId: 'paul'    },
    { parentId: 'lena',   childId: 'paul'    },
    // Frank + Nora → Diane (half-sibling of Paul)
    { parentId: 'frank',  childId: 'diane'   },
    { parentId: 'nora',   childId: 'diane'   },
    // George + Helen → Claire, James, Lily
    { parentId: 'george', childId: 'claire'  },
    { parentId: 'helen',  childId: 'claire'  },
    { parentId: 'george', childId: 'james'   },
    { parentId: 'helen',  childId: 'james'   },
    { parentId: 'george', childId: 'lily'    },
    { parentId: 'helen',  childId: 'lily'    },
    // Susan + Richard → Tom, Emma
    { parentId: 'susan',   childId: 'tom'    },
    { parentId: 'richard', childId: 'tom'    },
    { parentId: 'susan',   childId: 'emma'   },
    { parentId: 'richard', childId: 'emma'   },
    // Paul + Janet → Kyle
    { parentId: 'paul',   childId: 'kyle'   },
    { parentId: 'janet',  childId: 'kyle'   },
    // James + Sophie → Oliver, Grace
    { parentId: 'james',  childId: 'oliver' },
    { parentId: 'sophie', childId: 'oliver' },
    { parentId: 'james',  childId: 'grace'  },
    { parentId: 'sophie', childId: 'grace'  },
  ],
}

// ─── Prebuilt lookup maps (module-level, computed once) ────────────────────────

export const personById  = new Map(familyData.persons.map(p => [p.id, p]))
export const childrenOf  = new Map<string, string[]>()
export const parentsOf   = new Map<string, string[]>()
export const partnerOf   = new Map<string, string[]>()

for (const p of familyData.persons) {
  childrenOf.set(p.id, [])
  parentsOf.set(p.id, [])
  partnerOf.set(p.id, [])
}
for (const e of familyData.parentChild) {
  childrenOf.get(e.parentId)?.push(e.childId)
  parentsOf.get(e.childId)?.push(e.parentId)
}
for (const p of familyData.partnerships) {
  partnerOf.get(p.personA)?.push(p.personB)
  partnerOf.get(p.personB)?.push(p.personA)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const genderColor = (g: Person['gender']) =>
  g === 'M' ? '#3b82f6' : g === 'F' ? '#ec4899' : '#8b5cf6'

export const initials = (p: Person) =>
  `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`

export const lifespan = (p: Person) =>
  p.deathYear ? `${p.birthYear}–${p.deathYear}` : `b. ${p.birthYear}`
