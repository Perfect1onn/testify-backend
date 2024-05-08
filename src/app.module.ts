import { AuthModule } from "./auth";
import { TestModule } from "./test";
import { UserModule } from "./user";

export class AppModule {
      userModule: UserModule = new UserModule();
      authModule: AuthModule = new AuthModule();
      testModule: TestModule = new TestModule();
}