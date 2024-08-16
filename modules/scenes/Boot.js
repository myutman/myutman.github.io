export class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    create() {
        console.log('Boot.create');

        this.scene.start('Preloader');
    }
}
