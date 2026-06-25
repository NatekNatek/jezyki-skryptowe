const mineflayer = require('mineflayer')

const host     = 'localhost'
const port     = 25565
const username = 'CastleBuilder'

const bot = mineflayer.createBot({ host, port, username })

bot.on('error',  err    => console.error('Error:', err.message))
bot.on('kicked', reason => console.error('Kicked:', JSON.stringify(reason)))
bot.on('end',    ()     => console.log('Disconnected.'))

bot.once('spawn', async () => {
  await sleep(1500)

  const { x, y, z } = bot.entity.position
  // Place castle south of the bot, centred on its X
  const bx = Math.floor(x) - 12  // castle spans X+0..+23, bot at X+12
  const by = Math.floor(y)
  const bz = Math.floor(z) + 3   // castle starts 3 blocks ahead (+Z)

  console.log(`Building castle at origin ${bx} ${by} ${bz}...`)

  const cmds = buildCastle(bx, by, bz)
  console.log(`Sending ${cmds.length} commands (requires op)...`)

  for (const cmd of cmds) {
    bot.chat(cmd)
    await sleep(100)             // avoid server chat rate-limit
  }

  bot.chat('Castle complete!')
  console.log('Done.')
})

function buildCastle(bx, by, bz) {
  const out = []

  const fill = (x1,y1,z1, x2,y2,z2, block, mode='') => {
    const p1 = `${bx+x1} ${by+y1} ${bz+z1}`
    const p2 = `${bx+x2} ${by+y2} ${bz+z2}`
    out.push(`/fill ${p1} ${p2} ${block}${mode ? ' '+mode : ''}`)
  }

  const set = (x,y,z, block) =>
    out.push(`/setblock ${bx+x} ${by+y} ${bz+z} ${block}`)

  fill(-4,-2,-4,  27,14,27, 'air', 'replace')

  fill(-4,0,-4,  27,0,27, 'cobblestone')

  fill(-3,-1,-3,  26,-1,-1, 'cobblestone')   // north + NW/NE corners
  fill(-3,-1,24,  26,-1,26, 'cobblestone')   // south + SW/SE corners
  fill(-3,-1,  0,  -1,-1,23, 'cobblestone')  // west
  fill(24,-1,  0,  26,-1,23, 'cobblestone')  // east

  fill(-3,0,-3,  26,0,-1, 'water')   // north
  fill(-3,0,24,  26,0,26, 'water')   // south
  fill(-3,0, 0,  -1,0,23, 'water')   // west
  fill(24,0, 0,  26,0,23, 'water')   // east

  fill(10,0,24,  13,0,26, 'oak_planks')

  fill(0,1,0,  23,8,23, 'stone_bricks')
  fill(2,1,2,  21,8,21, 'air', 'replace')

  fill(10,1,22,  13,4,23, 'air', 'replace')

  fill( 9,1,23,   9,4,23, 'oak_log')
  fill(14,1,23,  14,4,23, 'oak_log')
  fill( 9,5,23,  14,5,23, 'oak_log')

  // Left tower  (X=0..5,  Z=18..23)
  fill( 0,1,18,   5,10,23, 'stone_bricks')
  fill( 1,1,19,   4,10,22, 'air', 'replace')

  // Right tower (X=18..23, Z=18..23)
  fill(18,1,18,  23,10,23, 'stone_bricks')
  fill(19,1,19,  22,10,22, 'air', 'replace')

  for (const wz of [7, 15]) {
    fill(0,4,wz,  1,5,wz, 'air', 'replace')
    set(0,4,wz, 'iron_bars') ;  set(0,5,wz, 'iron_bars')
  }
  
  for (const wz of [7, 15]) {
    fill(22,4,wz,  23,5,wz, 'air', 'replace')
    set(23,4,wz, 'iron_bars') ;  set(23,5,wz, 'iron_bars')
  }

  for (let x = 0; x <= 23; x += 2) set(x,9,23, 'stone_bricks')  // south
  for (let x = 0; x <= 23; x += 2) set(x,9, 0, 'stone_bricks')  // north
  for (let z = 1; z <= 22; z += 2) set( 0,9,z,  'stone_bricks')  // west
  for (let z = 1; z <= 22; z += 2) set(23,9,z,  'stone_bricks')  // east

  for (let x = 0; x <= 5; x += 2) {
    set(x,11,18, 'stone_bricks') ;  set(x,11,23, 'stone_bricks')
  }
  for (let z = 19; z <= 23; z += 2) {
    set(0,11,z, 'stone_bricks') ;  set(5,11,z, 'stone_bricks')
  }
  for (let x = 18; x <= 23; x += 2) {
    set(x,11,18, 'stone_bricks') ;  set(x,11,23, 'stone_bricks')
  }
  for (let z = 19; z <= 23; z += 2) {
    set(18,11,z, 'stone_bricks') ;  set(23,11,z, 'stone_bricks')
  }

  return out
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
