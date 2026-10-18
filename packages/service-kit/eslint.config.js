import service from "../../eslint.service.js";

// service-kit — общая техника, не сервис: слоёв домена у него нет
export default [...service, { rules: { "boundaries/dependencies": "off" } }];
