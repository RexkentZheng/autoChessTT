const config = {
  "db": {
    "database": "dzvpn-subserver",
    "username": "root",
    "password": "root",
    "options": {
      "dialect": "mysql",
      "host": "127.0.0.1",
      "port": 3306,
      "operatorsAliases": false,
      "define": {
        "underscored": false,
        "freezeTableName": true,
        "charset": "utf8",
        "dialectOptions": {
          "collate": "utf8_general_ci"
        },
        "engine": "InnoDB"
      },
      "pool": {
        "min": 2,
        "max": 10,
        "idle": 300000
      }
    }
  },
  "server": {
    "port": 8987
  },
  "mailUrl": "http://127.0.0.1:8987/register",
};

module.exports = config;