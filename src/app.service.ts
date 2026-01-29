import path from 'path';
import fs from 'node:fs';
import { Injectable } from '@nestjs/common';
import { createCanvas, registerFont } from 'canvas';
import { DateTime, Settings } from 'luxon';

@Injectable()
export class AppService {
  private readonly WIDTH = 1179;
  private readonly HEIGHT = 2556;

  private readonly BACKGROUND_COLOR = '#000';

  private readonly CIRCLE_RADIUS = 20;
  private readonly CIRCLE_SPACING = 61;
  private readonly CIRCLE_COLOR_PASSED = '#f5f5f5';
  private readonly CIRCLE_COLOR_TODAY = '#e65f2e';
  private readonly CIRCLE_COLOR_FUTURE = '#6b6b6b';

  private readonly DAYS_IN_ROW = 15;

  private readonly PADDIND_X = 0;
  private readonly PADDIND_Y = 140;

  constructor() {
    Settings.defaultZone = 'America/Sao_Paulo';

    const poppinsTtf = path.join(
      process.cwd(),
      'assets/fonts/Poppins-Regular.ttf',
    );

    fs.readFileSync(poppinsTtf);

    registerFont(poppinsTtf, {
      family: 'Poppins',
    });
  }

  public generateWallpaper(): Buffer {
    const yearDays = this.getDaysInYear();
    const daysPassed = this.daysPassedInYear();

    const canvas = createCanvas(this.WIDTH, this.HEIGHT);
    const context = canvas.getContext('2d');

    context.fillStyle = this.BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const [width, height] = this.calculateArea(yearDays);

    const x = this.WIDTH / 2 - width / 2 + this.CIRCLE_RADIUS + this.PADDIND_X;
    const y =
      this.HEIGHT / 2 - height / 2 + this.CIRCLE_RADIUS + this.PADDIND_Y;

    let horizontal = 0;
    let vertical = 0;

    for (let day = 0; day < yearDays; day++) {
      if (day % this.DAYS_IN_ROW === 0 && day > 0) {
        vertical++;
        horizontal = 0;
      }

      context.beginPath();

      context.arc(
        x + this.CIRCLE_SPACING * horizontal,
        y + this.CIRCLE_SPACING * vertical,
        this.CIRCLE_RADIUS,
        0,
        Math.PI * 2,
      );

      context.fillStyle =
        day + 1 < daysPassed
          ? this.CIRCLE_COLOR_PASSED
          : day + 1 === daysPassed
            ? this.CIRCLE_COLOR_TODAY
            : this.CIRCLE_COLOR_FUTURE;

      context.fill();

      horizontal++;
    }

    const percentage = ((daysPassed / yearDays) * 100).toFixed(1) + '%';
    const daysLeft = `${yearDays - daysPassed}d left`;

    const text = `${daysLeft} • ${percentage}`;

    context.font = 'normal 50px Poppins';
    const textMetrics = context.measureText(text);
    context.fillText(
      text,
      (canvas.width - textMetrics.width) / 2,
      canvas.height - 215,
    );

    return canvas.toBuffer('image/png');
  }

  private calculateArea(yearDays: number): [number, number] {
    const lines = Math.floor(yearDays / this.DAYS_IN_ROW) + 1;

    const spacing = this.CIRCLE_SPACING - 40;

    const circleWidth = this.CIRCLE_RADIUS * 2 + spacing;
    const circleHeight = this.CIRCLE_RADIUS * 2 + spacing;

    const width = circleWidth * this.DAYS_IN_ROW - spacing;
    const height = circleHeight * lines - spacing;

    return [width, height];
  }

  private daysPassedInYear(): number {
    return DateTime.now().ordinal;
  }

  private getDaysInYear(): number {
    const year = DateTime.now().year;
    return DateTime.local(year).daysInYear;
  }
}
