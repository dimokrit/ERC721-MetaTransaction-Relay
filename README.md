Проект позволяет:
- Деплоить ERC721 NFT контракт, с использованием стандарта ERC2771, позволяющем проводить метатранзакции
- Вызывать функцию mint
- Вызывать функцию safeTransferFromMeta (Метатрансфер NFT)

Создание провайдера и релаера
- Зарегестрируйтесь в Openzeppelin Defender (https://defender.openzeppelin.com)
- Создайте Релаер (https://docs.openzeppelin.com/defender/module/relayers)
- Создайте API ключи для релаера (https://docs.openzeppelin.com/defender/module/relayers#api-keys)Обязательно сохраните secret key!
- Если необходимо, воспользуйтесь faucet для тестовой сети sepolia
  - https://www.alchemy.com/dapps/sepolia-faucet
  - https://www.sepoliafaucet.io/
  - https://faucets.chain.link/sepolia
- Пополните баланс релаера (Необходимо отправить на адрес релаера токены)

Деплой
Деплоить можно в любой EVM сети, рабочая сеть будет такой же, какая установлена в релаере
Будет развернуто 2 контракта - Erc721Relayable и Forwarder, второй необходим для реализации логики метатранзакций
Деплой будет происходить от имени релаера (Баланс должен быть пополнен для комиссии)
Адреса контрактов будут выведены в консоль, а также сохранены в папке deployments

- Заполните Relayer и Deploy settings параметры в файле .env
- Запустите файл actions/deploy

Минт
- Заполните Mint settings параметры в файле .env
- Запустите файл actions/mint

Метатрансфер
- Заполните MetaTransfer settings параметры в файле .env (Не забудьте про приватный ключ отправителя)
- Запустите файл actions/metaTransfer

*Вы можете взаимодействовать с внешними контрактами, установив соответсвующие адреса в ERC721 и FORWARDER (Если нет, оставьте поля пустыми)