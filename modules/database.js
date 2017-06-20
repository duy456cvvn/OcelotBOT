/**
 * Created by Peter on 07/06/2017.
 */
const config = require('config');
const pasync = require('promise-async');
var knex = require('knex')(config.get("Database"));
module.exports = function(bot){
    return {
        name: "Database Module",
        enabled: true,
        init: function init(cb){
            const USERS_TABLE           = "eb_users";
            const SERVER_BALANCE_TABLE  = "eb_server_balances";
            const TRANSACTIONS_TABLE    = "eb_transactions";
            const SERVERS_TABLE         = "eb_servers";
            const LOTTERY_TABLE         = "eb_lottery";
            const REWARDS_TABLE         = "eb_rewardroles";
            const SHOP_TABLE            = "eb_shop";
            const INVENTORY_TABLE       = "eb_inventory";



            bot.database = {
                addServer: function addNewServer(serverID, addedBy){
                    return knex.insert({
                        server: serverID,
                        addedby: addedBy
                    }).into(SERVERS_TABLE);
                },
                getServer: function getServer(serverID){
                    return knex.select().from(SERVERS_TABLE).where({server: serverID}).limit(1);
                },
                setServerSetting: function setServerSetting(server, setting, value){
                    return knex(SERVERS_TABLE).update(setting, value).where({server: server}).limit(1);
                },
                getServerCurrency: function getServerCurrency(server){
                  return knex.select("serverCurrencyName", "usePluralCurrency").from(SERVERS_TABLE).where({server: server}).limit(1);
                },
                getServers: function getServers(){
                    return knex.select().from(SERVERS_TABLE);
                },

                getServersWithSetting: function getServersWithSetting(setting){
                    return knex.select().from(SERVERS_TABLE).whereNotNull(setting).andWhereNot(setting, 0);
                },
                getPrefixes: function getPrefixes(){
                    return knex.select("server","prefix").from(SERVERS_TABLE);
                }
            };

            cb();
        }
    }
};