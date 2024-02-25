import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const welcome = `
    Hello, Visitor,

    I am Taiwo Babalola, a backend engineer who loves the process
    of GROWTH and LEARNING.

    My stack includes Nestjs, Express, TS/JS, SQL (MySQL, POSTGRESQL)
    and I am currently learning C#/.NET to broaden my scope and deliver
    quality code and results. I can also learn new tools as required.

    Contact Me:
              Twitter: @realtaiwo_peter
              Github: https://www.gtihub.com/Taiwopeter-babs
              Linkedin: https://www.linkedin.com/in/taiwo-babalola
    
    `;

    return welcome;
  }
}
