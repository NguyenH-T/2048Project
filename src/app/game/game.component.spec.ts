import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DIMENSIONS, GameComponent, TileData } from './game.component';
import { PositionIndex } from './tile-movement.component';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#copyAndFilterTiles removes deleted', () => {
    const comp = new GameComponent()
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 2 }))
    
    const t2 = new TileData(2, 2, { row: 0, col: 3 })
    t2.deleted = true
    tiles.set(2, t2)

    const t3 = new TileData(3, 4, { row: 0, col: 3 })
    t3.combined = true
    tiles.set(3, t3)

    const out = comp.copyAndFilterTiles(tiles)

    const expected = new Map<number, TileData>()
    expected.set(1, new TileData(1, 2, { row: 0, col: 2 }))
    expected.set(3, new TileData(3, 4, { row: 0, col: 3 }))

    expect(out).toEqual(expected)
  })

  it('#copyAndFilterTiles removes nothing', () => {
    const comp = new GameComponent()
    let tiles = new Map<number, TileData>()
    
    const out = comp.copyAndFilterTiles(tiles)
    
    expect(out.size).toEqual(0)
  })

  it('#findEmptyPositions with only 1 empty', () => { 
    const comp = new GameComponent()
    let tiles = new Map<number, TileData>()
    let count = 0
    const totalTiles = 15

    for (let i = 0; i < DIMENSIONS && count < totalTiles; i++) {
      for (let j = 0; j < DIMENSIONS && count < totalTiles; j++) {
        tiles.set(count, new TileData(count++, 2, { row: i, col: j }))
      }
    }

    let out = comp.findEmptyPositions(tiles)

    const expected = [{ row: 3, col: 3 }]
    expect(out).toEqual(expected)
  })

  it('#findEmptyPositions with all empty', () => {
    const comp = new GameComponent()
    let tiles = new Map<number, TileData>()

    const out = comp.findEmptyPositions(tiles)

    const expected : PositionIndex[] = []
    for (let i = 0; i < DIMENSIONS; i++) {
      for (let j = 0; j < DIMENSIONS; j++) {
        expected.push({row: i, col: j})
      }
    }

    expect(out).toEqual(expected)
  })

  it('#findEmptyPositions with filled Tiles', () => {
    const comp = new GameComponent()
    let tiles = new Map<number, TileData>()
    let count = 0

    for (let i = 0; i < DIMENSIONS; i++) {
      for (let j = 0; j < DIMENSIONS; j++) {
        tiles.set(count, new TileData(count++, 2, { row: i, col: j }))
      }
    }

    let out = comp.findEmptyPositions(tiles)

    expect(out.length).toEqual(0)
  })

  it('#spawnRandomTiles spawns 2 tiles', () => {
    const comp = new GameComponent()

    const iterations = 1000
    
    let tiles = new Map<number, TileData>()
    for (let i = 0; i < iterations; i++) {
      comp.spawnRandomTiles(2, tiles, comp.tileId)
      expect(tiles.size).toEqual(2)
    
      const items = []
      for (let tile of tiles.values()) {
        items.push(tile)
      }

      expect(items[0].pos.row == items[1].pos.row && items[0].pos.col == items[1].pos.col).withContext('the tiles are not on the same space').toBeFalse()
      tiles.clear()
    }
  })

  it('#spawnRandomTiles spawns more then available slots', () => {
    const comp = new GameComponent()
    let tiles = new Map<number, TileData>()
    const limit = 15
    let count = 0

    for (let i = 0; i < DIMENSIONS && count < limit; i++) {
      for (let j = 0; j < DIMENSIONS && count < limit; j++) {
        tiles.set(count, new TileData(count++, 2, { row: i, col: j }))
      }
    }

    comp.spawnRandomTiles(2, tiles, count)
    
    expect(tiles.size).toEqual(16)
    expect(tiles.get(15) !== undefined).withContext('The only empty tile is spawned').toBeTrue()
  })

  it('#moveTilesHorizontal move all tiles from left bound to right bound', () => {
    const comp = new GameComponent()
    const matrix = [[1, -1, -1, -1], [-1, 2, -1, -1], [-1, -1, 3, -1], [-1, -1, -1, 4]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 0 }))
    tiles.set(2, new TileData(2, 2, { row: 1, col: 1 }))
    tiles.set(3, new TileData(3, 2, { row: 2, col: 2 }))
    tiles.set(4, new TileData(4, 2, { row: 3, col: 3 }))
    comp.moveTilesHorizontal(0, 1, matrix, tiles)
    
    expect(tiles.get(1)!.pos).toEqual({ row: 0, col: 3 })
    expect(tiles.get(2)!.pos).toEqual({ row: 1, col: 3 })
    expect(tiles.get(3)!.pos).toEqual({ row: 2, col: 3 })
    expect(tiles.get(4)!.pos).toEqual({ row: 3, col: 3 })
  })

  it('#moveTilesHorizontal move all tiles from right bound to left bound', () => {
    const comp = new GameComponent()
    const matrix = [[1, -1, -1, -1], [-1, 2, -1, -1], [-1, -1, 3, -1], [-1, -1, -1, 4]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 0 }))
    tiles.set(2, new TileData(2, 2, { row: 1, col: 1 }))
    tiles.set(3, new TileData(3, 2, { row: 2, col: 2 }))
    tiles.set(4, new TileData(4, 2, { row: 3, col: 3 }))
    comp.moveTilesHorizontal(3, -1, matrix, tiles)
    
    expect(tiles.get(1)!.pos).toEqual({ row: 0, col: 0 })
    expect(tiles.get(2)!.pos).toEqual({ row: 1, col: 0 })
    expect(tiles.get(3)!.pos).toEqual({ row: 2, col: 0 })
    expect(tiles.get(4)!.pos).toEqual({ row: 3, col: 0 })
  })

  it('#moveTilesVertical move all tiles from top bound to bottom bound', () => {
    const comp = new GameComponent()
    const matrix = [[1, -1, -1, -1], [-1, 2, -1, -1], [-1, -1, 3, -1], [-1, -1, -1, 4]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 0 }))
    tiles.set(2, new TileData(2, 2, { row: 1, col: 1 }))
    tiles.set(3, new TileData(3, 2, { row: 2, col: 2 }))
    tiles.set(4, new TileData(4, 2, { row: 3, col: 3 }))
    comp.moveTilesVertical(0, 1, matrix, tiles)
    
    expect(tiles.get(1)!.pos).toEqual({ row: 3, col: 0 })
    expect(tiles.get(2)!.pos).toEqual({ row: 3, col: 1 })
    expect(tiles.get(3)!.pos).toEqual({ row: 3, col: 2 })
    expect(tiles.get(4)!.pos).toEqual({ row: 3, col: 3 })
  })

  it('#moveTilesVertical move all tiles from bottom bound to top bound', () => {
    const comp = new GameComponent()
    const matrix = [[1, -1, -1, -1], [-1, 2, -1, -1], [-1, -1, 3, -1], [-1, -1, -1, 4]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 0 }))
    tiles.set(2, new TileData(2, 2, { row: 1, col: 1 }))
    tiles.set(3, new TileData(3, 2, { row: 2, col: 2 }))
    tiles.set(4, new TileData(4, 2, { row: 3, col: 3 }))
    comp.moveTilesVertical(3, -1, matrix, tiles)
    
    expect(tiles.get(1)!.pos).toEqual({ row: 0, col: 0 })
    expect(tiles.get(2)!.pos).toEqual({ row: 0, col: 1 })
    expect(tiles.get(3)!.pos).toEqual({ row: 0, col: 2 })
    expect(tiles.get(4)!.pos).toEqual({ row: 0, col: 3 })
  })

  it('Simple #combine tile right', () => {
    const comp = new GameComponent()
    const matrix = [[-1, -1, 2, 1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 3 }))
    tiles.set(2, new TileData(2, 2, { row: 0, col: 2 }))
    comp.moveTilesHorizontal(0, 1, matrix, tiles)
    
    let expectedTile1 = new TileData(1, 4, { row: 0, col: 3 })
    expectedTile1.combined = true
    let expectedTile2 = new TileData(2, 2, { row: 0, col: 3 })
    expectedTile2.deleted = true

    expect(tiles.get(1)!).withContext('furthest tile right is increased').toEqual(expectedTile1)
    expect(tiles.get(2)!).withContext('to be deleted tile is in the same spot as combined').toEqual(expectedTile2)    
  })

  it('Simple #combine tile left', () => {
    const comp = new GameComponent()
    const matrix = [[2, 1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 1 }))
    tiles.set(2, new TileData(2, 2, { row: 0, col: 0 }))
    comp.moveTilesHorizontal(3, -1, matrix, tiles)
    
    let expectedTile1 = new TileData(1, 2, { row: 0, col: 0 })
    expectedTile1.deleted = true
    let expectedTile2 = new TileData(2, 4, {row: 0, col: 0})
    expectedTile2.combined = true

    expect(tiles.get(1)!).withContext('to be deleted tile is in the same spot as combined').toEqual(expectedTile1)
    expect(tiles.get(2)!).withContext('furthest tile left is increased').toEqual(expectedTile2)
  })

  it('Simple #combine tile top', () => {
    const comp = new GameComponent()
    const matrix = [[-1, 1, -1, -1], [-1, 2, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 1 }))
    tiles.set(2, new TileData(2, 2, { row: 1, col: 1 }))
    comp.moveTilesVertical(3, -1, matrix, tiles)
    
    let expectedTile1 = new TileData(1, 4, { row: 0, col: 1 })
    expectedTile1.combined = true
    let expectedTile2 = new TileData(2, 2, { row: 0, col: 1 })
    expectedTile2.deleted = true

    expect(tiles.get(1)!).withContext('furthest tile top is increased').toEqual(expectedTile1)
    expect(tiles.get(2)!).withContext('to be deleted tile is in same spot as combined').toEqual(expectedTile2)
  })

  it('Simple #combine tile bottom', () => {
    const comp = new GameComponent()
    const matrix = [[-1, -1, -1, -1], [-1, -1, -1, -1], [-1, 1, -1, -1], [-1, 2, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 2, col: 1 }))
    tiles.set(2, new TileData(2, 2, { row: 3, col: 1 }))
    comp.moveTilesVertical(0, 1, matrix, tiles)

    let expectedTile1 = new TileData(1, 2, { row: 3, col: 1 })
    expectedTile1.deleted = true
    let expectedTile2 = new TileData(2, 4, { row: 3, col: 1 })
    expectedTile2.combined = true

    expect(tiles.get(2)!).withContext('furthest tile bottom is increased').toEqual(expectedTile2)
    expect(tiles.get(1)!).withContext('to be deleted tile is in same spot as combined').toEqual(expectedTile1)
  })

  it('Simple non #combine tile right', () => {
    const comp = new GameComponent()
    const matrix = [[2, -1, -1, 1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 4, { row: 0, col: 3 }))
    tiles.set(2, new TileData(2, 2, { row: 0, col: 0 }))
    comp.moveTilesHorizontal(0, 1, matrix, tiles)
  
    expect(tiles.get(2)!.pos).toEqual({ row: 0, col: 2 })
    expect(tiles.get(2)!.combined).toBeFalse()
    expect(tiles.get(2)!.deleted).toBeFalse()
  })

  it('Simple non #combine tile left', () => {
    const comp = new GameComponent()
    const matrix = [[2, -1, -1, 1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 3 }))
    tiles.set(2, new TileData(2, 4, { row: 0, col: 0 }))
    comp.moveTilesHorizontal(3, -1, matrix, tiles)
    
    expect(tiles.get(1)!.pos).toEqual({row: 0, col: 1})
    expect(tiles.get(1)!.combined).toBeFalse()
    expect(tiles.get(1)!.deleted).toBeFalse()
  })

  it('Simple non #combine tile top', () => {
    const comp = new GameComponent()
    const matrix = [[1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [2, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 4, { row: 0, col: 0 }))
    tiles.set(2, new TileData(2, 2, { row: 3, col: 0 }))
    comp.moveTilesVertical(3, -1, matrix, tiles)
    
    expect(tiles.get(2)!.pos).toEqual({row: 1, col: 0})
    expect(tiles.get(2)!.combined).toBeFalse()
    expect(tiles.get(2)!.deleted).toBeFalse()
  })

  it('Simple non #combine tile bottom', () => {
    const comp = new GameComponent()
    const matrix = [[1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [2, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 4, { row: 0, col: 0 }))
    tiles.set(2, new TileData(2, 2, { row: 3, col: 0 }))
    comp.moveTilesVertical(0, 1, matrix, tiles)
    
    expect(tiles.get(1)!.pos).toEqual({row: 2, col: 0})
    expect(tiles.get(1)!.combined).toBeFalse()
    expect(tiles.get(1)!.deleted).toBeFalse()
  })

  it('Combine after combinee was moved right', () => {
    const comp = new GameComponent()
    const matrix = [[2, -1, 1,-1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 2 }))
    tiles.set(2, new TileData(2, 2, { row: 0, col: 0 }))
    comp.moveTilesHorizontal(0, 1, matrix, tiles)
    
    expect(tiles.get(1)!.pos).withContext('move to right').toEqual({ row: 0, col: 3 })
    expect(tiles.get(2)!.pos).withContext('move to combine with rightmost tile').toEqual({ row: 0, col: 3 })

    expect(tiles.get(1)!.combined).toBeTrue()
    expect(tiles.get(2)!.deleted).toBeTrue()
  })

  it('Combine after combinee was move left', () => {
    const comp = new GameComponent()
    const matrix = [[-1, 2, -1, 1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 3 }))
    tiles.set(2, new TileData(2, 2, { row: 0, col: 1 }))
    comp.moveTilesHorizontal(3, -1, matrix, tiles)
    
    expect(tiles.get(2)!.pos).withContext('move to left').toEqual({ row: 0, col: 0})
    expect(tiles.get(1)!.pos).withContext('move to combine with leftmost tile').toEqual({row: 0, col: 0})

    expect(tiles.get(2)!.combined).toBeTrue()
    expect(tiles.get(1)!.deleted).toBeTrue()
  })

  it('Combine after combinee was moved down', () => {
    const comp = new GameComponent()
    const matrix = [[2, -1, -1, -1], [-1, -1, -1, -1], [1, -1, -1, -1], [-1, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 2, col: 0 }))
    tiles.set(2, new TileData(2, 2, { row: 0, col: 0 }))
    comp.moveTilesVertical(0, 1, matrix, tiles)
    
    expect(tiles.get(1)!.pos).withContext('move to bottom').toEqual({ row: 3, col: 0})
    expect(tiles.get(2)!.pos).withContext('move to combine with bottommost tile').toEqual({row: 3, col: 0})

    expect(tiles.get(1)!.combined).toBeTrue()
    expect(tiles.get(2)!.deleted).toBeTrue()
  })

  it('Combine after combinee was moved up', () => {
    const comp = new GameComponent()
    const matrix = [[-1, -1, -1, -1], [2, -1, -1, -1], [-1, -1, -1, -1], [1, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 3, col: 0 }))
    tiles.set(2, new TileData(2, 2, { row: 1, col: 0 }))
    comp.moveTilesVertical(3, -1, matrix, tiles)
    
    expect(tiles.get(2)!.pos).withContext('move to top').toEqual({ row: 0, col: 0})
    expect(tiles.get(1)!.pos).withContext('move to combine with topmost tile').toEqual({row: 0, col: 0})

    expect(tiles.get(2)!.combined).toBeTrue()
    expect(tiles.get(1)!.deleted).toBeTrue()
  })

  it('Non combine after combine', () => {
    const comp = new GameComponent()
    const matrix = [[1, -1, 2, 3], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 4, { row: 0, col: 0 }))
    tiles.set(2, new TileData(2, 2, { row: 0, col: 2 }))
    tiles.set(3, new TileData(3, 2, { row: 0, col: 3 }))
    comp.moveTilesHorizontal(0, 1, matrix, tiles)
    
    const expected = new Map<number, TileData>()
    expected.set(1, new TileData(1, 4, { row: 0, col: 2 }))

    const tile2 = new TileData(2, 2, { row: 0, col: 3 })
    tile2.deleted = true
    expected.set(2, tile2)

    const tile3 = new TileData(3, 4, {row: 0, col: 3 })
    tile3.combined = true
    expected.set(3, tile3)
    
    expect(tiles).withContext('cannot combine with a tile that has already combined in the current movement').toEqual(expected)
  })

  it('Combine after non combine', () => {
    const comp = new GameComponent()
    const matrix = [[1, -1, -1, -1], [2, -1, -1, -1], [3, -1, -1, -1], [-1, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 0 }))
    tiles.set(2, new TileData(2, 2, { row: 1, col: 0 }))
    tiles.set(3, new TileData(3, 4, { row: 2, col: 0 }))
    comp.moveTilesVertical(0, 1, matrix, tiles)
    
    const expected = new Map < number, TileData>()
    
    const t1 = new TileData(1, 2, { row: 2, col: 0 })
    t1.deleted = true

    const t2 = new TileData(2, 4, { row: 2, col: 0 })
    t2.combined = true

    const t3 = new TileData(3, 4, { row: 3, col: 0 })

    expected.set(1, t1)
    expected.set(2, t2)
    expected.set(3, t3)
    
    expect(tiles).withContext('cannot combine due to already combining this movement').toEqual(expected)
  })

  it('no movement', () => {
    const comp = new GameComponent()
    const matrix = [[1, -1, -1, -1], [2, -1, -1, -1], [3, -1, -1, -1], [4, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 0 }))
    tiles.set(2, new TileData(2, 4, { row: 1, col: 0 }))
    tiles.set(3, new TileData(3, 8, { row: 2, col: 0 }))
    tiles.set(4, new TileData(4, 16, { row: 3, col: 0 }))
    comp.moveTilesVertical(3, -1, matrix, tiles)
    
    let expected = new Map<number, TileData>()
    
    expected.set(1, new TileData(1, 2, { row: 0, col: 0 }))
    expected.set(2, new TileData(2, 4, { row: 1, col: 0 }))
    expected.set(3, new TileData(3, 8, { row: 2, col: 0 }))
    expected.set(4, new TileData(4, 16, { row: 3, col: 0 }))

    expect(tiles).toEqual(expected)
  })

  it('combine favours the direction of movement', () => {
    const comp = new GameComponent()
    const matrix = [[1, -1, -1, -1], [2, -1, -1, -1], [3, -1, -1, -1], [4, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 0 }))
    tiles.set(2, new TileData(2, 2, { row: 1, col: 0 }))
    tiles.set(3, new TileData(3, 2, { row: 2, col: 0 }))
    tiles.set(4, new TileData(4, 4, { row: 3, col: 0 }))
    comp.moveTilesVertical(0, 1, matrix, tiles)
    
    const expected = new Map<number, TileData>()
    
    const t1 = new TileData(1, 2, { row: 1, col: 0 })
    
    const t2 = new TileData(2, 2, { row: 2, col: 0 })
    t2.deleted = true
    
    const t3 = new TileData(3, 4, { row: 2, col: 0 })
    t3.combined = true

    const t4 = new TileData(4, 4, { row: 3, col: 0 })

    expected.set(1, t1)
    expected.set(2, t2)
    expected.set(3, t3)
    expected.set(4, t4)

    expect(tiles).toEqual(expected)
  })

  it('Dual combine in same section', () => {
    const comp = new GameComponent()
    const matrix = [[1, 2, 3, 4], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]]
    let tiles = new Map<number, TileData>()
    tiles.set(1, new TileData(1, 2, { row: 0, col: 0 }))
    tiles.set(2, new TileData(2, 2, { row: 0, col: 1 }))
    tiles.set(3, new TileData(3, 2, { row: 0, col: 2 }))
    tiles.set(4, new TileData(4, 2, { row: 0, col: 3 }))
    comp.moveTilesHorizontal(0, 1, matrix, tiles)
    
    const expected = new Map<number, TileData>()

    const tile1 = new TileData(1, 2, { row: 0, col: 2 })
    tile1.deleted = true

    const tile2 = new TileData(2, 4, { row: 0, col: 2 })
    tile2.combined = true

    const tile3 = new TileData(3, 2, { row: 0, col: 3 })
    tile3.deleted = true

    const tile4 = new TileData(4, 4, { row: 0, col: 3 })
    tile4.combined = true

    expected.set(1, tile1)
    expected.set(2, tile2)
    expected.set(3, tile3)
    expected.set(4, tile4)
    
    expect(tiles).withContext('there should be two adjacent 4 tiles in this').toEqual(expected)
  })
});
