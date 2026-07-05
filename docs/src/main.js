import 'style.css'
import Phaser from 'phaser'

const sizes={
  width:1280,
  height: 768,
}

const speedDown = 700
const tileSize = 128;
const groundY = Math.floor(sizes.height / tileSize) -1;

class GameScene extends Phaser.Scene{
  constructor(){
    super("scene-game")
    this.player
    this.cursor
    this.playerSpeed = speedDown -200
  }

  preload(){
    this.load.image("bg", "assets/Background.png")
    this.load.image("hero", "assets/Pink_Monster.png")
    this.load.image("spikes", "assets/Spikes.png");
    this.load.image("ground", "assets/Ground.png");
    this.load.image("platL", "assets/PlatformLeft.png");
    this.load.image("platR", "assets/PlatformRight.png");
    this.load.image("platM", "assets/PlatformMiddle.png");
    this.load.image("coin", "assets/Coin.png");
    this.load.image("crystals", "assets/Crystals.png");
    this.load.audio("cheers", "assets/Cheers.mp3");
    
  }
  create(){
    this.add.image(0,0,"bg").setOrigin(0,0).setScrollFactor(0.01).setScale(1.1,1.1);
    this.platforms = this.physics.add.staticGroup();
    this.player = this.physics.add.sprite(
      sizes.width / 2,
      sizes.height - 300,
      "hero"
    );
    this.player.setScale(2,2)
    this.player.setCollideWorldBounds(true)

    this.platforms = this.physics.add.staticGroup();
    this.spikes = this.physics.add.staticGroup();
    this.crystals = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();
    this.placeGround(0, 10);
    this.addCoin(12, groundY -3);
    this.addSpike(6, groundY - 0.5, "spikes");
    this.addSpike(7, groundY - 0.5, "spikes");
    this.placeGround(15, 22);
    this.addSpike(16, groundY - 0.5, "spikes");
    this.addSpike(22, groundY - 0.5, "spikes");
    this.addPlatform(25, groundY - 2);
    this.addCoin(27, groundY -3);
    this.addPlatform(29, groundY - 3);
    this.addCoin(30, groundY -4.5);
    this.addSpike(30, groundY - 3.5, "spikes");
    this.placeGround(32,32);
    this.addCoin(32, groundY -2);
    this.placeGround(35,35);
    this.placeGround(38,38);
    this.addCoin(40, groundY -2);
    this.placeGround(42,42);
    this.addPlatform(46, groundY - 2);
    this.placeGround(50, 60);
    this.addSpike(50, groundY - 0.5, "spikes");
    this.addSpike(51, groundY - 0.5, "spikes");
    this.addCrystal(59, groundY - 1);
    this.physics.add.collider(this.player, this.platforms);
    this.cursor = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, 7680, sizes.height);
    this.physics.world.setBounds(0, 0, 7680, sizes.height);

    this.player.setCollideWorldBounds(true);
    this.player.body.onWorldBounds = true;

    this.physics.world.checkCollision.down = false;

    this.physics.add.overlap(
      this.player,
      this.spikes,
      () => {
          this.scene.restart();
      }
    );

    this.physics.add.overlap(
      this.player,
      this.crystals,
      this.finishLevel,
      null,
      this
    );

    this.input.keyboard.once("keydown", () => {
    this.sound.context.resume();
    });

    this.score = 0;

    this.physics.add.overlap(
    this.player,
    this.coins,
    this.collectCoin,
    null,
    this
    );
    
    this.scoreText = this.add.text(20, 20, "Coins: 0/5", {
    fontSize: "32px",
    color: "#ffffff"
    });

    this.scoreText.setScrollFactor(0);
  }

  update(){
    const {left, right, up} = this.cursor;

    if (left.isDown) {
        this.player.setVelocityX(Math.max(this.player.body.velocity.x - 20, -300));
        this.player.setFlipX(true);
    } else if (right.isDown) {
        this.player.setVelocityX(Math.min(this.player.body.velocity.x + 20, 300));
        this.player.setFlipX(false);
    } else {
        this.player.setVelocityX(this.player.body.velocity.x * 0.85);
    }
    if (Phaser.Input.Keyboard.JustDown(up) &&this.player.body.blocked.down){
      this.player.setVelocityY(-700);
    }
    
    if (this.player.y > sizes.height) {
    this.scene.restart();
    }
          
  }

  addTile(x, y, texture) {
    const tile = this.platforms.create(x * tileSize, y * tileSize, texture);

    tile.setOrigin(0, 0);
    tile.refreshBody(); // important for static bodies
  }

  placeGround(xStart, xEnd) {
    for (let x = xStart; x <= xEnd; x++) {
        this.addTile(x, groundY, "ground");
    }
  }
  addPlatform(startX, y) {
    this.addTile(startX, y, "platL");
    this.addTile(startX + 1, y, "platM");
    this.addTile(startX + 2, y, "platR");
  }

  addSpike(x, y) {
    const spike = this.spikes.create(
        x * tileSize,
        y * tileSize,
        "spikes"
    );

    spike.setOrigin(0, 0);
    spike.refreshBody();
  }

  addCoin(x, y) {
    const coin = this.coins.create(
        x * tileSize,
        y * tileSize,
        "coin"
    );
    coin.setScale(0.7, 0.7)
    coin.setOrigin(0, 0);
    coin.refreshBody();
  }

  addCrystal(x, y) {
    const crystal = this.crystals.create(
        x * tileSize,
        y * tileSize,
        "crystals"
    );

    crystal.setOrigin(0, 0);
    crystal.refreshBody();
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);

    this.score++;

    this.scoreText.setText(`Coins: ${this.score}/5`);
  }

  finishLevel(player, crystal) {

    crystal.disableBody(true, true);

    const cheer = this.sound.add("cheers");

    cheer.once("complete", () => {
        this.scene.restart();
    });

    cheer.play();

  }
}

const config = {
  type:Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics:{
    default:"arcade",
    arcade:{
      gravity:{y:speedDown},
      debug:true
    }
  },
  scene:[GameScene]
}

const game = new Phaser.Game(config)