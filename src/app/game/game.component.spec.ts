import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameComponent, TileData } from './game.component';

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
    
    console.log(tiles.get(1)!)
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
});
