import axios from 'axios';
import readline from 'readline';
import fs from 'fs';
import os from 'os';
import chalk from 'chalk'; 


class NitroGen {
    constructor() {
        this.fileName = "Nitro_Codes.txt";  
        this.valid = []; 
        this.invalid = 0;  
        this.webhookUrl = null;  
    }

 
    printLogo() {
        console.clear(); 
        console.log(chalk.blue(`
 _      _  _____  ____  ____    _____ _____ _      _____ ____  ____  _____  ____  ____ 
/ \\  /|/ \\/__ __\\/  __\\/  _ \\  /  __//  __// \\  /|/  __//  __\\/  _ \\/__ __\\/  _ \\/  __\\
| |\\ ||| |  / \\  |  \\/|| / \\|  | |  _|  \\  | |\\ |||  \\  |  \\/|| / \\|  / \\  | / \\||  \\/|
| | \\||| |  | |  |    /| \\_/|  | |_//|  /_ | | \\|||  /_ |    /| |-||  | |  | \\_/||    /
\\_/  \\|\\_/  \\_/  \\_/\\_\\\\____/  \\____\\\\____\\\\_/  \\|\\____\\\\_/\\_\\\\_/ \\|  \\_/  \\____/\\_/\\_\\
                                                                                      
        `));
        console.log(chalk.green("\n Nitro Gen - Discord.gg/t4a"));
        console.log(chalk.green("-------------------------------\n"));
    }


    generateCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < 16; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `https://discord.gift/${code}`;
    }

    async checkCode(code) {
        const nitroCode = code.replace('https://discord.gift/', '');  
        const url = `https://discordapp.com/api/v9/entitlements/gift-codes/${nitroCode}?with_application=false&with_subscription_plan=true`;
        try {
            const response = await axios.get(url);
            return response.status === 200; 
        } catch (error) {
            return false;  
        }
    }

    async sendToWebhook(message) {
        if (this.webhookUrl) {
            try {
                await axios.post(this.webhookUrl, {
                    content: message
                });
                console.log(chalk.green(`Message sent to webhook: ${message}`));
            } catch (error) {
                console.error(chalk.red('Error sending to webhook:'), error.message);
            }
        }
    }

    async main() {
        this.printLogo(); 

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('How many Nitro codes would you like to generate? ', async (num) => {
            num = parseInt(num);
            if (isNaN(num)) {
                console.log(chalk.red("Invalid input, please enter a number."));
                rl.close();
                return;
            }

            rl.question('Enter the Discord webhook URL (or leave blank to skip): ', async (url) => {
                if (url && !url.startsWith('https://discord.com/api/webhooks/')) {
                    console.log(chalk.red("Invalid webhook URL."));
                    rl.close();
                    return;
                }

                this.webhookUrl = url !== "" ? url : null;

                if (this.webhookUrl) {
                    await this.sendToWebhook('🔄 Nitro code generation started...');
                }

                console.log(chalk.yellow(`\nGenerating ${num} Nitro codes...\n`));

                for (let i = 0; i < num; i++) {
                    const code = this.generateCode();
                    const isValid = await this.checkCode(code);

                    if (isValid) {
                        this.valid.push(code);
                        await this.sendToWebhook(`🎉 Valid Nitro code found: ${code}`);

                        fs.appendFileSync(this.fileName, `${code}\n`);

                        console.log(chalk.green(`[Valid] ${code}`));
                    } else {
                        this.invalid++;

                        console.log(chalk.red(`[Invalid] ${code}`));
                    }
                    if (os.platform() === 'win32') {
                        process.stdout.write(`\x1b]0;NitroGen - ${this.valid.length} Valid | ${this.invalid} Invalid\x07`);
                    }
                }

                console.log(chalk.green(`\nResults:\nValid: ${this.valid.length}\nInvalid: ${this.invalid}`));

                if (this.webhookUrl) {
                    console.log(chalk.blue("\nWebhook configured:"));
                    console.log(chalk.green(`Valid codes sent: ${this.valid.length}`));
                    console.log(chalk.red(`Invalid codes generated: ${this.invalid}`));
                }

                rl.close();
            });
        });
    }
}

const generator = new NitroGen();
generator.main();
