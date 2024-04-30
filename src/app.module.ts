import { AuthModule } from "./auth";
import { UserModule } from "./user";

export class AppModule {
      userModule: UserModule = new UserModule();
      authModule: AuthModule = new AuthModule();
}