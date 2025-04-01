import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from './app.module';
import 'dotenv/config';

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function() { return this.toString() }

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
  .setTitle("API example")
  .setDescription("The API description")
  .setVersion("1.0")
  .addTag("example")
  .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3001);

}
bootstrap();
